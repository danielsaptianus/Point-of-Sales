import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { IPaymuService } from './services/ipaymu.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleEntity } from './entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private ipaymuService: IPaymuService,
  ) {}

  async checkout(userId: number, createSaleDto: CreateSaleDto): Promise<SaleEntity> {
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

        // Kalkulasi ketersediaan akumulasi stok produk
        const stockAggregate = await tx.stock.aggregate({
          _sum: { quantity: true },
          where: { product_id: item.product_id },
        });
        const currentStock = stockAggregate._sum.quantity || 0;

        if (currentStock < item.quantity) {
          throw new BadRequestException(`Stok produk ${product.name} tidak mencukupi. Tersedia: ${currentStock}, diminta: ${item.quantity}`);
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

      // 2. Buat record transaksi utama (Transaction)
      const transaction = await tx.transaction.create({
        data: {
          invoice_number: invoiceNumber,
          subtotal,
          tax,
          discount,
          total,
          status: 'PENDING', // default status
          user_id: userId,
          transaction_items: {
            createMany: {
              data: transactionItemsData,
            },
          },
        },
      });

      // 3. Kurangi stok produk secara otomatis dengan membuat mutasi stok keluar (type: OUT)
      for (const item of transactionItemsData) {
        await tx.stock.create({
          data: {
            product_id: item.product_id,
            quantity: -item.quantity, // Nilai negatif untuk pengurangan stok
            type: 'OUT',
            notes: `Auto stock deduction from sale ${invoiceNumber}`,
            transaction_id: transaction.id,
          },
        });
      }

      // 4. Catat detail pembayaran (Payment) & Hubungkan ke iPaymu SDK jika non-tunai
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
      } else if (payment_method === 'IPAYMU_REDIRECT') {
        // Mengumpulkan nama produk untuk payload iPaymu
        const productNames = [];
        const productQty = [];
        const productPrice = [];

        for (const item of transactionItemsData) {
          const product = await tx.product.findUnique({ where: { id: item.product_id } });
          if (product) {
            productNames.push(product.name);
            productQty.push(item.quantity);
            productPrice.push(item.price);
          }
        }

        // Panggil custom iPaymu SDK service
        const iPaymuResponse = await this.ipaymuService.createRedirectPayment({
          product: productNames,
          qty: productQty,
          price: productPrice,
          amount: total,
          referenceId: invoiceNumber,
        });

        // Buat record pembayaran dengan status PENDING dan simpan URL redirect
        await tx.payment.create({
          data: {
            payment_method: 'IPAYMU_REDIRECT',
            payment_gateway: 'IPAYMU',
            reference_id: iPaymuResponse.SessionID,
            status: 'PENDING',
            checkout_url: iPaymuResponse.Url,
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

      return new SaleEntity(finalTransaction);
    });
  }

  async findAll(query: any): Promise<SaleEntity[]> {
    const { status, cashier_id } = query;
    const where: any = { deleted_at: null };

    if (status) {
      where.status = status;
    }
    if (cashier_id) {
      where.user_id = Number(cashier_id);
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        transaction_items: { include: { product: true } },
        payment: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return transactions.map((t) => new SaleEntity(t));
  }

  async findOne(id: number): Promise<SaleEntity> {
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

    return new SaleEntity(transaction);
  }

  async handleWebhook(headers: any, body: any): Promise<void> {
    // 1. Validasi digital signature menggunakan iPaymu SDK Service
    const isValid = this.ipaymuService.verifyNotificationSignature(headers, body);
    if (!isValid) {
      throw new BadRequestException('Kredensial atau signature webhook iPaymu tidak valid');
    }

    const payload = typeof body === 'string' ? JSON.parse(body) : body;
    const { referenceId, status, trx_id } = payload;

    // Cari transaksi POS yang bersangkutan berdasarkan nomor invoice (referenceId)
    const transaction = await this.prisma.transaction.findUnique({
      where: { invoice_number: referenceId },
      include: { payment: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan invoice ${referenceId} tidak ditemukan`);
    }

    // Pemetaan status pembayaran dari iPaymu ke status transaksi internal POS
    let mappedStatus = 'PENDING';
    let paymentStatus = 'PENDING';
    let paidAt = null;

    if (status === 'berhasil') {
      mappedStatus = 'PAID';
      paymentStatus = 'PAID';
      paidAt = new Date();
    } else if (status === 'expired') {
      mappedStatus = 'FAILED';
      paymentStatus = 'EXPIRED';
    } else if (status === 'gagal') {
      mappedStatus = 'FAILED';
      paymentStatus = 'FAILED';
    }

    // Update status transaksi dan pembayaran secara atomik
    await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: mappedStatus },
      }),
      this.prisma.payment.update({
        where: { transaction_id: transaction.id },
        data: {
          status: paymentStatus,
          reference_id: String(trx_id),
          paid_at: paidAt,
        },
      }),
    ]);
  }

  async voidTransaction(id: number): Promise<SaleEntity> {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, deleted_at: null },
      include: {
        transaction_items: true,
        payment: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaksi dengan ID ${id} tidak ditemukan`);
    }

    if (transaction.status === 'CANCELLED') {
      throw new ConflictException('Transaksi sudah dibatalkan sebelumnya');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Batalkan status transaksi internal
      await tx.transaction.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      // 2. Batalkan status pembayaran
      if (transaction.payment) {
        await tx.payment.update({
          where: { transaction_id: id },
          data: { status: 'CANCELLED' },
        });
      }

      // 3. Kembalikan stok barang (Membuat catatan mutasi masuk/IN sebesar quantity yang dibeli)
      for (const item of transaction.transaction_items) {
        await tx.stock.create({
          data: {
            product_id: item.product_id,
            quantity: item.quantity, // Nilai positif untuk mengembalikan stok
            type: 'IN',
            notes: `Stock restored from voided sale ${transaction.invoice_number}`,
            transaction_id: transaction.id,
          },
        });
      }

      const finalTransaction = await tx.transaction.findUnique({
        where: { id },
        include: {
          transaction_items: { include: { product: true } },
          payment: true,
        },
      });

      return new SaleEntity(finalTransaction);
    });
  }
}
