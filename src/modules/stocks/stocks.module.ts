import { Module } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { StocksController } from './controllers/v1/stocks.controller';

@Module({
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
