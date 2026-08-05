import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { StocksService } from './stocks.service';
import { CreateStockDto } from '@common/dto/create-stock.dto';
import { UpdateStockDto } from '@common/dto/update-stock.dto';
import { StockEntity } from '@common/entities/stock.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
} from '@common/decorators/api-response.decorator';

@ApiTags('Stocks')
@ApiCookieAuth()
@Controller({ path: 'stocks', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Create a new stock mutation (Admin & Staff)' })
  @ApiSuccessResponse(StockEntity)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createStockDto: CreateStockDto): Promise<StockEntity> {
    return this.stocksService.create(createStockDto);
  }

  @Get()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get all stock mutations (Admin & Staff)' })
  @ApiSuccessArrayResponse(StockEntity)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<StockEntity[]> {
    return this.stocksService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get stock mutation by ID (Admin & Staff)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(StockEntity)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Stock record not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<StockEntity> {
    return this.stocksService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update stock mutation (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(StockEntity)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Stock record not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<StockEntity> {
    return this.stocksService.update(id, updateStockDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete stock mutation record (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Stock record deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Stock record not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.stocksService.remove(id);
  }
}
