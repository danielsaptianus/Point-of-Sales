import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({ example: 'L' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsString()
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({ example: 'SINGLE' })
  @IsString()
  @IsOptional()
  marital_status?: string;

  @ApiPropertyOptional({ example: '08123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Jl. Jendral Sudirman No 1' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'EMP-001' })
  @IsString()
  @IsOptional()
  employee_number?: string;

  @ApiPropertyOptional({ example: 'FULL_TIME' })
  @IsString()
  @IsOptional()
  employment_type?: string;

  @ApiPropertyOptional({ example: 5000000 })
  @IsOptional()
  salary?: number;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsString()
  @IsOptional()
  hire_date?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsString()
  @IsOptional()
  termination_date?: string;

  @ApiPropertyOptional({ example: 'BCA' })
  @IsString()
  @IsOptional()
  bank_name?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsString()
  @IsOptional()
  bank_account_number?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  bank_account_name?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
