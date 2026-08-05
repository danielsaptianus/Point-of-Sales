import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food' })
  @IsString()
  @IsNotEmpty({ message: 'Category name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'Food and beverages category' })
  @IsString()
  @IsOptional()
  description?: string;
}
