import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { SaleEntity } from './entities/sale.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { GetUser } from '@common/decorators/get-user.decorator';
import { ApiSuccessResponse, ApiSuccessArrayResponse } from '@common/decorators/api-response.decorator';

@ApiTags('Sales')
@ApiCookieAuth()
@Controller({ path: 'sales', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Create a new POS transaction (checkout)' })
  @ApiSuccessResponse(SaleEntity)
  @ApiResponse({ status: 400, description: 'Validation failed or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkout(
    @GetUser('userId') userId: number,
    @Body() createSaleDto: CreateSaleDto,
  ): Promise<SaleEntity> {
    return this.salesService.checkout(userId, createSaleDto);
  }

  @Get()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get all sales history' })
  @ApiQuery({ name: 'status', required: false, example: 'PAID', description: 'Filter by transaction status' })
  @ApiQuery({ name: 'cashier_id', required: false, example: 1, description: 'Filter by cashier user ID' })
  @ApiSuccessArrayResponse(SaleEntity)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('status') status?: string,
    @Query('cashier_id') cashier_id?: string,
  ): Promise<SaleEntity[]> {
    return this.salesService.findAll({ status, cashier_id });
  }

  @Get(':id')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get sales transaction by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(SaleEntity)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SaleEntity> {
    return this.salesService.findOne(id);
  }
}
