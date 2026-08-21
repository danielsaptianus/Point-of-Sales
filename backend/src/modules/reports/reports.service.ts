import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';

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
}
