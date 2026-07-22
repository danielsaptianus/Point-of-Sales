import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesQueryDto {
  @ApiPropertyOptional({ example: 'PAID', description: 'Filter by transaction status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Filter by cashier user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cashier_id?: number;

  @ApiPropertyOptional({ example: '2026-07-20', description: 'Start date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'startDate must be a valid ISO date string (YYYY-MM-DD)' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-07-22', description: 'End date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'endDate must be a valid ISO date string (YYYY-MM-DD)' })
  endDate?: string;
}
