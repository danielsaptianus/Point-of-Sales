import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockEntity } from './entities/stock.entity';

@Injectable()
export class StocksService {
  constructor(private prisma: PrismaService) {}

  async create(createStockDto: CreateStockDto): Promise<StockEntity> {
    const { product_id } = createStockDto;

    // Validate Product exists
    const product = await this.prisma.product.findFirst({
      where: { id: product_id, deleted_at: null },
    });

    if (!product) {
      throw new BadRequestException('Invalid product ID');
    }

    const stock = await this.prisma.stock.create({
      data: createStockDto,
      include: { product: { include: { category: true } } },
    });

    return new StockEntity(stock);
  }

  async findAll(): Promise<StockEntity[]> {
    const stocks = await this.prisma.stock.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { created_at: 'desc' },
    });

    return stocks.map((st) => new StockEntity(st));
  }

  async findOne(id: number): Promise<StockEntity> {
    const stock = await this.prisma.stock.findFirst({
      where: { id },
      include: { product: { include: { category: true } } },
    });

    if (!stock) {
      throw new NotFoundException(`Stock record with ID ${id} not found`);
    }

    return new StockEntity(stock);
  }

  async update(id: number, updateStockDto: UpdateStockDto): Promise<StockEntity> {
    await this.findOne(id);

    if (updateStockDto.product_id) {
      const product = await this.prisma.product.findFirst({
        where: { id: updateStockDto.product_id, deleted_at: null },
      });

      if (!product) {
        throw new BadRequestException('Invalid product ID');
      }
    }

    const updatedStock = await this.prisma.stock.update({
      where: { id },
      data: updateStockDto,
      include: { product: { include: { category: true } } },
    });

    return new StockEntity(updatedStock);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.stock.delete({
      where: { id },
    });
  }
}
