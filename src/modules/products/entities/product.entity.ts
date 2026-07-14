import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product as PrismaProduct } from '@prisma/client';
import { CategoryEntity } from '@modules/categories/entities/category.entity';

export class ProductEntity implements Partial<PrismaProduct> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sku: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  price: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  category_id: number;

  @ApiPropertyOptional({ type: () => CategoryEntity })
  category?: CategoryEntity;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at: Date | null;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
    if (partial.category) {
      this.category = new CategoryEntity(partial.category);
    }
  }
}
