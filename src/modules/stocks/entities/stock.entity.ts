import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Stock as PrismaStock } from '@prisma/client';
import { ProductEntity } from '@modules/products/entities/product.entity';

export class StockEntity implements Partial<PrismaStock> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiProperty()
  product_id: number;

  @ApiPropertyOptional({ type: () => ProductEntity })
  product?: ProductEntity;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  constructor(partial: Partial<StockEntity>) {
    Object.assign(this, partial);
    if (partial.product) {
      this.product = new ProductEntity(partial.product);
    }
  }
}
