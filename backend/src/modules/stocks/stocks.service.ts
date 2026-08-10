import { Product, Stock } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateStockDto } from '@modules/stocks/core/dto/create-stock.dto';
import { UpdateStockDto } from '@modules/stocks/core/dto/update-stock.dto';

@Injectable()
export class StocksService {
  constructor(private prisma: PrismaService) {}

  private transformStock(st: any) {
    return {
      id: st.id,
      created_at: st.created_at,
      product_id: st.product_id,
      quantity: st.quantity,
      type: st.type,
      notes: st.notes,
    };
  }

  async create(createStockDto: CreateStockDto): Promise<any> {
    const { product_id, type } = createStockDto;

    // 1. Pembuatan stok awal hanya boleh bertipe IN
    if (type !== 'IN') {
      throw new BadRequestException('Pembuatan stok awal hanya diperbolehkan dengan tipe IN');
    }

    // 2. Validate Product exists
    const product = await this.prisma.product.findFirst({
      where: { id: product_id, deleted_at: null },
    });

    if (!product) {
      throw new BadRequestException('Invalid product ID');
    }

    // 3. Hanya boleh ada 1 catatan stok awal per produk
    const existingStock = await this.prisma.stock.findFirst({
      where: { product_id },
    });

    if (existingStock) {
      throw new ConflictException(
        'Stok awal untuk produk ini sudah terdaftar. Gunakan metode PATCH untuk memperbarui stok.',
      );
    }

    const stock = await this.prisma.stock.create({
      data: createStockDto,
      include: { product: { include: { category: true } } },
    });

    return this.transformStock(stock);
  }

  async findAll(): Promise<any[]> {
    const stocks = await this.prisma.stock.findMany({
      include: { product: { include: { category: true } } },
      orderBy: { created_at: 'desc' },
    });

    return stocks.map((st) => this.transformStock(st));
  }

  async findOne(id: number): Promise<any> {
    const stock = await this.prisma.stock.findFirst({
      where: { id },
      include: { product: { include: { category: true } } },
    });

    if (!stock) {
      throw new NotFoundException(`Stock record with ID ${id} not found`);
    }

    return this.transformStock(stock);
  }

  async update(id: number, updateStockDto: UpdateStockDto): Promise<any> {
    const existing = await this.findOne(id);

    if (updateStockDto.product_id) {
      const product = await this.prisma.product.findFirst({
        where: { id: updateStockDto.product_id, deleted_at: null },
      });

      if (!product) {
        throw new BadRequestException('Invalid product ID');
      }
    }

    const quantity =
      updateStockDto.quantity !== undefined
        ? existing.quantity + updateStockDto.quantity
        : undefined;

    const updatedStock = await this.prisma.stock.update({
      where: { id },
      data: {
        ...updateStockDto,
        ...(quantity !== undefined ? { quantity } : {}),
      },
      include: { product: { include: { category: true } } },
    });

    return this.transformStock(updatedStock);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.stock.delete({
      where: { id },
    });
  }
}
