import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsInt, Min, IsEnum, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class SaleItemDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt({ message: 'Product ID must be an integer' })
  @IsNotEmpty({ message: 'Product ID is required' })
  product_id: number;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'CASH', enum: ['CASH'], description: 'Payment method' })
  @IsEnum(['CASH'], { message: 'Payment method must be CASH' })
  @IsNotEmpty({ message: 'Payment method is required' })
  payment_method: string;

  @ApiPropertyOptional({ example: 1000, description: 'Tax amount' })
  @IsNumber({}, { message: 'Tax must be a number' })
  @Min(0, { message: 'Tax cannot be negative' })
  @IsOptional()
  tax?: number = 0;

  @ApiPropertyOptional({ example: 5000, description: 'Discount amount' })
  @IsNumber({}, { message: 'Discount must be a number' })
  @Min(0, { message: 'Discount cannot be negative' })
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ type: [SaleItemDto] })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @ArrayMinSize(1, { message: 'Sale must contain at least 1 item' })
  items: SaleItemDto[];
}
