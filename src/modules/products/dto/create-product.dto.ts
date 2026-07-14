import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsInt, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Espresso' })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @ApiProperty({ example: 'ESP-001' })
  @IsString()
  @IsNotEmpty({ message: 'Product SKU is required' })
  sku: string;

  @ApiPropertyOptional({ example: 'Single shot espresso' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 15000.0 })
  @IsNumber()
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @ApiProperty({ example: 1, description: 'Category ID' })
  @IsInt({ message: 'Category ID must be an integer' })
  category_id: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
