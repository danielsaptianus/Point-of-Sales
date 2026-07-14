import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, Min, IsEnum, IsString, IsOptional } from 'class-validator';

export class CreateStockDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt({ message: 'Product ID must be an integer' })
  @IsNotEmpty({ message: 'Product ID is required' })
  product_id: number;

  @ApiProperty({ example: 50, description: 'Quantity of stock transaction' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;

  @ApiProperty({ example: 'IN', enum: ['IN', 'OUT'], description: 'Transaction type' })
  @IsEnum(['IN', 'OUT'], { message: 'Type must be either IN or OUT' })
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  @ApiPropertyOptional({ example: 'Initial stock replenishment' })
  @IsString()
  @IsOptional()
  notes?: string;
}
