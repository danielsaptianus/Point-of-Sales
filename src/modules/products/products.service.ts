import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const { sku, category_id } = createProductDto;

    // Check SKU conflict
    const existingSku = await this.prisma.product.findFirst({
      where: { sku, deleted_at: null },
    });

    if (existingSku) {
      throw new ConflictException('Product SKU already exists');
    }

    // Validate Category exists
    const category = await this.prisma.category.findFirst({
      where: { id: category_id, deleted_at: null },
    });

    if (!category) {
      throw new BadRequestException('Invalid category ID');
    }

    const product = await this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });

    return new ProductEntity(product);
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await this.prisma.product.findMany({
      where: { deleted_at: null },
      include: { category: true },
      orderBy: { created_at: 'desc' },
    });

    return products.map((prod) => new ProductEntity(prod));
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return new ProductEntity(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    await this.findOne(id);

    if (updateProductDto.sku) {
      const existingSku = await this.prisma.product.findFirst({
        where: {
          sku: updateProductDto.sku,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingSku) {
        throw new ConflictException('Product SKU already exists');
      }
    }

    if (updateProductDto.category_id) {
      const category = await this.prisma.category.findFirst({
        where: { id: updateProductDto.category_id, deleted_at: null },
      });

      if (!category) {
        throw new BadRequestException('Invalid category ID');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: { category: true },
    });

    return new ProductEntity(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
