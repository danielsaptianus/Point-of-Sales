import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { IPaymuService } from './services/ipaymu.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, IPaymuService],
  exports: [SalesService, IPaymuService],
})
export class SalesModule {}
