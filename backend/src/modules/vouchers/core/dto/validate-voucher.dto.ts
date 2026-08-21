import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class ValidateVoucherDto {
  @ApiProperty({ example: 'DISC20' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 200000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  subtotal: number;
}
