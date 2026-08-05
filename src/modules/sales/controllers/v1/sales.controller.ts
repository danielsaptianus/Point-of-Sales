import { Transaction } from '@prisma/client';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Headers,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from '../../sales.service';
import { CreateSaleDto } from '@modules/sales/core/dto/create-sale.dto';
import { SalesQueryDto } from '@modules/sales/core/dto/sales-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { GetUser } from '@common/decorators/get-user.decorator';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
} from '@common/decorators/api-response.decorator';
import { Public } from '@common/decorators/public.decorator';
import { MidtransWebhookDto } from '@modules/sales/core/dto/midtrans-webhook.dto';

@ApiTags('Sales')
@ApiCookieAuth()
@Controller({ path: 'sales', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Create a new POS transaction (checkout)' })
  @ApiSuccessResponse(CreateSaleDto)
  @ApiResponse({ status: 400, description: 'Validation failed or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkout(
    @GetUser('userId') userId: number,
    @Body() createSaleDto: CreateSaleDto,
  ): Promise<Transaction> {
    return this.salesService.checkout(userId, createSaleDto);
  }

  @Get()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get all sales history' })
  @ApiSuccessArrayResponse(CreateSaleDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: SalesQueryDto): Promise<Transaction[]> {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get sales transaction by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateSaleDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Transaction> {
    return this.salesService.findOne(id);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook callback notification from Midtrans' })
  @ApiResponse({ status: 200, description: 'Webhook callback processed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid webhook signature or request validation failed',
  })
  async handleWebhook(@Headers() headers: Record<string, string>, @Body() body: any) {
    await this.salesService.handleWebhook(headers, body);

    return { success: true, message: 'Webhook callback processed successfully' };
  }

  @Public()
  @Get('payment/return')
  @ApiOperation({ summary: 'Midtrans callback redirect page after transaction success' })
  paymentReturn(@Query() query: any) {
    return {
      statusCode: 200,
      message: 'Pembayaran berhasil diproses. Anda dapat menutup halaman ini.',
      data: query,
    };
  }

  @Public()
  @Get('payment/cancel')
  @ApiOperation({ summary: 'Midtrans callback redirect page after transaction cancellation' })
  paymentCancel(@Query() query: any) {
    return {
      statusCode: 200,
      message: 'Pembayaran telah dibatalkan oleh pengguna.',
      data: query,
    };
  }

  @Post(':id/void')
  @Roles('Admin')
  @ApiOperation({ summary: 'Void a sales transaction and restore stock (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateSaleDto)
  @ApiResponse({ status: 400, description: 'Transaction already voided or failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async voidTransaction(@Param('id', ParseIntPipe) id: number): Promise<Transaction> {
    return this.salesService.voidTransaction(id);
  }
}
