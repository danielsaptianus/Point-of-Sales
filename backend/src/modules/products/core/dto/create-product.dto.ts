import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Susu UHT Cokelat 250ml' })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @ApiProperty({ example: 'SKU-SUSU-UHT-001' })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku: string;

  @ApiPropertyOptional({ example: 'Susu UHT rasa cokelat kemasan kotak' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 6500 })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Category ID must be an integer' })
  @IsNotEmpty({ message: 'Category ID is required' })
  category_id: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  initial_stock?: number;
}
