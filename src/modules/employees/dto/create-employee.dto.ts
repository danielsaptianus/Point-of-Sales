import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsDateString } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-10023' })
  @IsString()
  @IsNotEmpty({ message: 'Employee number is required' })
  employee_number: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @ApiProperty({ example: 'Female', enum: ['Male', 'Female'] })
  @IsEnum(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;

  @ApiPropertyOptional({ example: '+628123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 10' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: '2026-07-16T12:00:00.000Z' })
  @IsDateString({}, { message: 'Hire date must be a valid ISO date string' })
  @IsOptional()
  hire_date?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @ApiProperty({ example: 2, description: 'Position ID' })
  @IsInt({ message: 'Position ID must be an integer' })
  @IsNotEmpty({ message: 'Position ID is required' })
  position_id: number;

  @ApiPropertyOptional({ example: 1, description: 'Optional linked login User ID' })
  @IsInt({ message: 'User ID must be an integer' })
  @IsOptional()
  user_id?: number;
}
