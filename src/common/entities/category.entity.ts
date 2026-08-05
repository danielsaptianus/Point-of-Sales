import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category as PrismaCategory } from '@prisma/client';

export class CategoryEntity implements Partial<PrismaCategory> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at: Date | null;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
