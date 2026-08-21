import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../../reports.service';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get real-time dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully.' })
  async getDashboardStats() {
    const data = await this.reportsService.getDashboardStats();
    return {
      statusCode: 200,
      message: 'Dashboard statistics retrieved successfully',
      data,
    };
  }

  @Get('revenue-analytics')
  @ApiOperation({ summary: 'Get revenue analytics for the last 7 days' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully.' })
  async getRevenueAnalytics() {
    const data = await this.reportsService.getRevenueAnalytics();
    return {
      statusCode: 200,
      message: 'Revenue analytics retrieved successfully',
      data,
    };
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiResponse({ status: 200, description: 'Recent transactions retrieved successfully.' })
  async getRecentTransactions() {
    const data = await this.reportsService.getRecentTransactions();
    return {
      statusCode: 200,
      message: 'Recent transactions retrieved successfully',
      data,
    };
  }
}
