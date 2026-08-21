import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class CloseShiftDto {
  @ApiProperty({ example: 1500000, description: 'Total uang fisik di laci saat ditutup' })
  @IsNumber({}, { message: 'Actual ending cash must be a number' })
  @Min(0, { message: 'Actual ending cash cannot be negative' })
  @IsNotEmpty({ message: 'Actual ending cash is required' })
  actual_ending_cash: number;

  @ApiPropertyOptional({ example: 'Ada selisih Rp 500 karena tidak ada kembalian receh' })
  @IsString()
  @IsOptional()
  notes?: string;
}
