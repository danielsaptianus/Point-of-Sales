import { Product, Transaction, Stock } from '@prisma/client';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { MidtransService } from './services/midtrans.service';
import { CreateSaleDto } from '@modules/sales/core/dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private midtransService: MidtransService,
  ) {}

  async checkout(userId: number, createSaleDto: CreateSaleDto): Promise<Transaction> {
    const { payment_method, tax = 0, discount = 0, items } = createSaleDto;

    // Menjalankan sekelompok operasi database dalam satu blok $transaction (atomik)
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const transactionItemsData = [];

      // 1. Validasi produk dan kalkulasi subtotal harga
      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.product_id, deleted_at: null },
        });

        if (!product) {
          throw new BadRequestException(`Product dengan ID ${item.product_id} tidak ditemukan`);
        }

        if (!product.is_active) {
          throw new BadRequestException(`Product ${product.name} sedang tidak aktif`);
        }

        // Kalkulasi ketersediaan akumulasi sisa stok produk (sum log mutasi)
        const stockAggregate = await tx.stock.aggregate({
          _sum: { quantity: true },
          where: { product_id: item.product_id },
        });
        const currentStock = stockAggregate._sum.quantity || 0;

        if (currentStock < item.quantity) {
          throw new BadRequestException(
            `Stok produk ${product.name} tidak mencukupi. Tersedia: ${currentStock}, diminta: ${item.quantity}`,
          );
        }

        const itemSubtotal = product.price * item.quantity;
        subtotal += itemSubtotal;

        transactionItemsData.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price,
          subtotal: itemSubtotal,
        });
      }

      const total = subtotal + tax - discount;
      if (total < 0) {
        throw new BadRequestException('Total transaksi tidak boleh bernilai negatif');
      }

      // Generate nomor invoice transaksi unik
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // 2. Buat record transaksi utama (Transaction) dengan status awal PENDING
      const transaction = await tx.transaction.create({
        data: {
          invoice_number: invoiceNumber,
          subtotal,
          tax,
          discount,
          total,
          status: 'PENDING',
          user_id: userId,
          transaction_items: {
            createMany: {
              data: transactionItemsData,
            },
          },
        },
      });

      // 3. Proses Pembayaran
      if (payment_method === 'CASH') {
        // Tunai langsung PAID
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'PAID' },
        });

        await tx.payment.create({
          data: {
            payment_method: 'CASH',
            status: 'PAID',
            paid_at: new Date(),
            transaction_id: transaction.id,
          },
        });
      } else if (payment_method === 'MIDTRANS_REDIRECT') {
        // Panggil custom Midtrans Snap API service untuk pembayaran online
        const midtransResponse = await this.midtransService.createSnapTransaction({
          amount: total,
          referenceId: invoiceNumber,
        });

        // Buat record pembayaran dengan status PENDING dan simpan Snap redirect URL di checkout_url
        await tx.payment.create({
          data: {
            payment_method: 'MIDTRANS_REDIRECT',
            payment_gateway: 'MIDTRANS',
            reference_id: midtransResponse.token,
            status: 'PENDING',
            checkout_url: midtransResponse.redirect_url,
            transaction_id: transaction.id,
          },
        });
      }

      // 4. Mutasi Stok Keluar dibuat langsung saat checkout (untuk CASH & PENDING)
      for (const item of transactionItemsData) {
        await tx.stock.create({
          data: {
            product_id: item.product_id,
            quantity: -item.quantity, // Nilai negatif untuk pengurangan stok
            type: 'OUT',
            notes: `Stock reserved from sale checkout ${invoiceNumber}`,
            transaction_id: transaction.id,
          },
        });
      }

      // Kembalikan data transaksi lengkap beserta relasinya
      const finalTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          transaction_items: { include: { product: true } },
          payment: true,
        },
      });

      return finalTransaction;
    });
  }

  async findAll(query: any): Promise<Transaction[]> {
    const { status, cashier_id, startDate, endDate } = query;
    const where: any = { deleted_at: null };

    if (status) {
      where.status = status;
    }
    if (cashier_id) {
      where.user_id = Number(cashier_id);
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        where.created_at.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        transaction_items: { include: { product: true } },
        payment: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return transactions.map((t) => t);
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, deleted_at: null },
      include: {
        transaction_items: { include: { product: true } },
        payment: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    return transaction;
  }

  /**
   * Menangani notifikasi webhook callback dari Midtrans secara publik & aman
   */
  async handleWebhook(headers: Record<string, string>, body: any): Promise<void> {
    console.log('=== SALES SERVICE handleWebhook ===');
    // 1. Verifikasi digital signature untuk memastikan request benar-benar dari Midtrans
    const isValid = this.midtransService.verifyNotificationSignature(body);
    if (!isValid) {
      console.log('Webhook signature verification failed!');
      throw new BadRequestException('Signature Midtrans tidak valid');
    }

    const { order_id, transaction_id, transaction_status } = body;
    console.log('Order ID (Invoice):', order_id);
    console.log('Transaction Status from Midtrans:', transaction_status);

    // 2. Cari transaksi berdasarkan invoice_number (order_id) ATAU transaction_id/snap token dari Midtrans
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        OR: [{ invoice_number: order_id }, { payment: { reference_id: String(transaction_id) } }],
      },
      include: {
        payment: true,
        transaction_items: true, // Sertakan untuk memutasi stok
      },
    });

    if (!transaction) {
      console.log(
        `Transaction with order_id ${order_id} or transaction_id ${transaction_id} not found in database!`,
      );
      throw new NotFoundException(`Transaksi tidak ditemukan (order_id: ${order_id})`);
    }

    console.log(
      'Found Transaction in DB:',
      transaction.invoice_number,
      'Current status:',
      transaction.status,
    );

    // Jika transaksi sudah lunas atau dibatalkan, abaikan (Idempotent)
    if (transaction.status !== 'PENDING') {
      console.log(`Transaction status is already final (${transaction.status}). Ignoring webhook.`);
      return;
    }

    const isPaid = transaction_status === 'settlement' || transaction_status === 'capture';
    const isFailed = ['deny', 'expire', 'cancel'].includes(transaction_status);

    console.log('Is Paid?:', isPaid, 'Is Failed?:', isFailed);

    if (isPaid) {
      console.log('Updating transaction status to PAID...');
      // Pembayaran Sukses / Berhasil
      await this.prisma.$transaction(async (tx) => {
        // Update status transaksi utama menjadi PAID
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'PAID' },
        });

        // Update status detail pembayaran menjadi PAID
        if (transaction.payment) {
          await tx.payment.update({
            where: { id: transaction.payment.id },
            data: { status: 'PAID', paid_at: new Date() },
          });
        }
      });
      console.log('Transaction status updated to PAID successfully.');
    } else if (isFailed) {
      console.log('Updating transaction status to FAILED and restoring stock...');
      // Pembayaran Gagal / Expired
      await this.prisma.$transaction(async (tx) => {
        // Update status transaksi utama menjadi FAILED
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'FAILED' },
        });

        // Update status detail pembayaran menjadi FAILED
        if (transaction.payment) {
          await tx.payment.update({
            where: { id: transaction.payment.id },
            data: { status: 'FAILED' },
          });
        }

        // KEMBALIKAN (RESTORE) STOK BARANG KARENA PEMBAYARAN ONLINE GAGAL
        for (const item of transaction.transaction_items) {
          await tx.stock.create({
            data: {
              product_id: item.product_id,
              quantity: item.quantity, // Nilai positif untuk mengembalikan stok
              type: 'IN', // Tipe IN untuk penambahan stok kembali
              notes: `Stock restored from failed online transaction ${transaction.invoice_number}`,
              transaction_id: transaction.id,
            },
          });
        }
      });
      console.log('Transaction status updated to FAILED and stock restored successfully.');
    }
  }

  /**
   * Membatalkan transaksi penjualan dan mengembalikan stok barang belanjaan ke persediaan (Admin Only)
   */
  async voidTransaction(id: number): Promise<Transaction> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Cari transaksi beserta detail item belanja & pembayaran
      const transaction = await tx.transaction.findFirst({
        where: { id, deleted_at: null },
        include: {
          transaction_items: { include: { product: true } },
          payment: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
      }

      // 2. Cek apakah transaksi sudah dalam status final (CANCELLED/FAILED)
      if (transaction.status === 'CANCELLED' || transaction.status === 'FAILED') {
        throw new BadRequestException(
          `Transaksi dengan status ${transaction.status} tidak dapat dibatalkan (void)`,
        );
      }

      const originalStatus = transaction.status;

      // 3. Update status Transaksi menjadi CANCELLED
      await tx.transaction.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 4. Update status Payment menjadi CANCELLED
      if (transaction.payment) {
        await tx.payment.update({
          where: { id: transaction.payment.id },
          data: { status: 'CANCELLED' },
        });
      }

      // 5. Restock barang jika transaksi sebelumnya berstatus PAID atau PENDING (stok sempat terpotong)
      // (Menggunakan penambahan record IN baru tanpa mengubah/menimpa record mutasi lama)
      if (originalStatus === 'PAID' || originalStatus === 'PENDING') {
        for (const item of transaction.transaction_items) {
          await tx.stock.create({
            data: {
              product_id: item.product_id,
              quantity: item.quantity, // Nilai positif untuk mengembalikan stok
              type: 'IN', // Tipe IN untuk penambahan stok kembali
              notes: `Stock restoration from voided sale ${transaction.invoice_number}`,
              transaction_id: transaction.id,
            },
          });
        }
      }

      // 6. Ambil data transaksi yang sudah terupdate
      const updatedTransaction = await tx.transaction.findUnique({
        where: { id },
        include: {
          transaction_items: { include: { product: true } },
          payment: true,
        },
      });

      return updatedTransaction;
    });
  }
}
