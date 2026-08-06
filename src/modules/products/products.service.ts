import { Product, Category } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateProductDto } from '@modules/products/core/dto/create-product.dto';
import { UpdateProductDto } from '@modules/products/core/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  private transformProduct(product: any) {
    const stock = product.stocks?.reduce((acc: number, s: any) => acc + s.quantity, 0) || 0;
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      is_active: product.is_active,
      stock,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
          }
        : undefined,
    };
  }

  async create(createProductDto: CreateProductDto): Promise<any> {
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
      include: { category: true, stocks: true },
    });

    return this.transformProduct(product);
  }

  async findAll(): Promise<any[]> {
    const products = await this.prisma.product.findMany({
      where: { deleted_at: null },
      include: { category: true, stocks: true },
      orderBy: { created_at: 'desc' },
    });

    return products.map((prod) => this.transformProduct(prod));
  }

  async findOne(id: number): Promise<any> {
    const product = await this.prisma.product.findFirst({
      where: { id, deleted_at: null },
      include: { category: true, stocks: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.transformProduct(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<any> {
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
      include: { category: true, stocks: true },
    });

    return this.transformProduct(updatedProduct);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
