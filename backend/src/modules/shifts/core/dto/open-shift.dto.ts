import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class OpenShiftDto {
  @ApiProperty({ example: 500000, description: 'Modal uang awal laci' })
  @IsNumber({}, { message: 'Starting cash must be a number' })
  @Min(0, { message: 'Starting cash cannot be negative' })
  @IsNotEmpty({ message: 'Starting cash is required' })
  starting_cash: number;
}
