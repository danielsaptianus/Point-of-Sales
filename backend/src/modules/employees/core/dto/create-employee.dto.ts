import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP-10023' })
  @IsString()
  @IsNotEmpty({ message: 'Employee number is required' })
  employee_number: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ example: 'P', enum: ['L', 'P'] })
  @IsEnum(['L', 'P', 'Male', 'Female'], { message: 'Gender must be valid' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;

  @ApiPropertyOptional({ example: '1990-01-01T00:00:00.000Z' })
  @IsDateString({}, { message: 'Birth date must be a valid ISO date string' })
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({ example: 'SINGLE', enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] })
  @IsEnum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'])
  @IsOptional()
  marital_status?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

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

  @ApiPropertyOptional({ example: '2030-01-01T00:00:00.000Z' })
  @IsDateString({}, { message: 'Termination date must be a valid ISO date string' })
  @IsOptional()
  termination_date?: string;

  @ApiPropertyOptional({ example: 'FULL_TIME', enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'] })
  @IsEnum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'])
  @IsOptional()
  employment_type?: string;

  @ApiPropertyOptional({ example: 5000000 })
  @IsNumber()
  @IsOptional()
  salary?: number;

  @ApiPropertyOptional({ example: 'BCA' })
  @IsString()
  @IsOptional()
  bank_name?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  @IsString()
  @IsOptional()
  bank_account_name?: string;

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
