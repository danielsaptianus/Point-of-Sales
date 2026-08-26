import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsInt,
  Min,
  IsIn,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
  IsString,
} from 'class-validator';
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
  @ApiProperty({
    example: 'MIDTRANS_REDIRECT',
    enum: ['CASH', 'MIDTRANS_REDIRECT'],
    description: 'Payment method',
  })
  @IsIn(['CASH', 'MIDTRANS_REDIRECT'], {
    message: 'Payment method must be CASH or MIDTRANS_REDIRECT',
  })
  @IsNotEmpty({ message: 'Payment method is required' })
  payment_method: string;


  @ApiPropertyOptional({ example: 'DISC20', description: 'Voucher code' })
  @IsString()
  @IsOptional()
  voucher_code?: string;

  @ApiPropertyOptional({ example: 'QRIS', description: 'Specific online payment type like QRIS or TRANSFER' })
  @IsString()
  @IsOptional()
  online_payment_type?: string;

  @ApiProperty({ type: [SaleItemDto] })
  @ValidateNested({ each: true })
  @Type(() => SaleItemDto)
  @ArrayMinSize(1, { message: 'Sale must contain at least 1 item' })
  items: SaleItemDto[];
}
