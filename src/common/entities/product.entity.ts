import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Product as PrismaProduct } from '@prisma/client';
import { CategoryEntity } from './category.entity';

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

  @ApiPropertyOptional()
  stock?: number;

  constructor(partial: any) {
    Object.assign(this, partial);
    if (partial.category) {
      this.category = new CategoryEntity(partial.category);
    }
    if (partial.stocks && Array.isArray(partial.stocks)) {
      this.stock = partial.stocks.reduce((sum, item) => sum + item.quantity, 0);
    } else {
      this.stock = partial.stock ?? 0;
    }
  }
}
