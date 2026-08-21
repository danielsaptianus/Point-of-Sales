import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../../reports.service';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/v1/reports')
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
}
