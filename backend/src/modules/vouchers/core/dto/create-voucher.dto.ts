import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({ example: 'DISC20', description: 'Unique voucher code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Diskon 20%', description: 'Voucher name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Diskon akhir tahun', description: 'Voucher description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'PERCENTAGE', enum: ['PERCENTAGE', 'FIXED'] })
  @IsEnum(['PERCENTAGE', 'FIXED'])
  @IsNotEmpty()
  discount_type: string;

  @ApiProperty({ example: 20, description: 'Discount value (e.g. 20 for 20% or 20000 for 20k)' })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum discount amount for percentage type' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Minimum transaction subtotal' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_transaction?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum times this voucher can be used' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  usage_limit?: number;

  @ApiProperty({ example: '2026-08-01T00:00:00Z', description: 'Start validity' })
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @ApiProperty({ example: '2026-08-31T23:59:59Z', description: 'End validity' })
  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @ApiPropertyOptional({ example: true, description: 'Is voucher active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
