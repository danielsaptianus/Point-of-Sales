import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { MidtransService } from './services/midtrans.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, MidtransService],
  exports: [SalesService, MidtransService],
})
export class SalesModule {}
