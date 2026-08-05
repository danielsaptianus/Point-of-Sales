import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './controllers/v1/sales.controller';
import { MidtransService } from './core/helpers/midtrans.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService, MidtransService],
  exports: [SalesService, MidtransService],
})
export class SalesModule {}
