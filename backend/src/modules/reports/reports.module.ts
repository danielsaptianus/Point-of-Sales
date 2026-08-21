import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/v1/reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
