import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    // 1. Total Revenue (Sum of 'PAID' or 'SETTLEMENT' transactions)
    const revenueResult = await this.prisma.transaction.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: ['PAID', 'SETTLEMENT'],
        },
        deleted_at: null,
      },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // 2. Total Orders (Count of Transactions)
    const totalOrders = await this.prisma.transaction.count({
      where: { deleted_at: null },
    });

    // 3. Total Products (Count of Products)
    const totalProducts = await this.prisma.product.count({
      where: { deleted_at: null },
    });

    // 4. Active Users (Count of Active Employees)
    const activeUsers = await this.prisma.employee.count({
      where: { 
        is_active: true,
        deleted_at: null 
      },
    });

    // 5. Total Movement (Count of Stock Transactions)
    const totalMovement = await this.prisma.stock.count();

    return {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      total_products: totalProducts,
      active_users: activeUsers,
      total_movement: totalMovement,
    };
  }

  async getRevenueAnalytics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: { in: ['PAID', 'SETTLEMENT'] },
        deleted_at: null,
        created_at: { gte: sevenDaysAgo },
      },
      select: {
        total: true,
        created_at: true,
      },
    });

    // Group by date
    const dailyRevenue = new Map<string, number>();
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyRevenue.set(dateStr, 0);
    }

    transactions.forEach(t => {
      const dateStr = t.created_at.toISOString().split('T')[0];
      if (dailyRevenue.has(dateStr)) {
        dailyRevenue.set(dateStr, dailyRevenue.get(dateStr)! + t.total);
      }
    });

    return Array.from(dailyRevenue, ([date, revenue]) => ({ date, revenue }));
  }

  async getRecentTransactions() {
    return this.prisma.transaction.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            email: true,
            employee: { select: { first_name: true, last_name: true } }
          }
        }
      }
    });
  }

  async exportTransactionsToExcel(startDate?: string, endDate?: string): Promise<Buffer> {
    const whereClause: any = { deleted_at: null };

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        whereClause.created_at.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { employee: { select: { first_name: true, last_name: true } } } },
        payment: true,
        transaction_items: {
          include: {
            product: true,
          }
        },
      }
    });

    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Ringkasan Invoice
    const invoiceSheet = workbook.addWorksheet('Ringkasan Transaksi');
    invoiceSheet.columns = [
      { header: 'No. Invoice', key: 'invoice_number', width: 22 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
      { header: 'Kasir', key: 'cashier', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Metode Pembayaran', key: 'payment_method', width: 20 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Diskon', key: 'discount', width: 15 },
      { header: 'PPN', key: 'tax', width: 15 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    // Styling Headers
    invoiceSheet.getRow(1).font = { bold: true };

    for (const t of transactions) {
      invoiceSheet.addRow({
        invoice_number: t.invoice_number,
        created_at: t.created_at.toLocaleString('id-ID'),
        cashier: t.user?.employee ? `${t.user.employee.first_name} ${t.user.employee.last_name || ''}`.trim() : 'Admin',
        status: t.status,
        payment_method: t.payment?.payment_method || '-',
        subtotal: t.subtotal,
        discount: t.discount,
        tax: t.tax,
        total: t.total,
      });
    }

    // Sheet 2: Rincian Barang
    const itemSheet = workbook.addWorksheet('Rincian Barang Terjual');
    itemSheet.columns = [
      { header: 'No. Invoice', key: 'invoice_number', width: 22 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
      { header: 'Kode Barang (SKU)', key: 'sku', width: 20 },
      { header: 'Nama Barang', key: 'product_name', width: 30 },
      { header: 'Harga Satuan', key: 'price', width: 15 },
      { header: 'Kuantitas', key: 'qty', width: 12 },
      { header: 'Subtotal Item', key: 'subtotal', width: 15 },
    ];

    itemSheet.getRow(1).font = { bold: true };

    for (const t of transactions) {
      for (const item of t.transaction_items) {
        itemSheet.addRow({
          invoice_number: t.invoice_number,
          created_at: t.created_at.toLocaleString('id-ID'),
          sku: item.product?.sku || '-',
          product_name: item.product?.name || '-',
          price: item.price,
          qty: item.quantity,
          subtotal: item.subtotal,
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as Buffer;
  }
}
