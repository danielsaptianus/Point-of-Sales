import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

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
}
