import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @ApiProperty({ example: 'Male', enum: ['Male', 'Female'] })
  @IsEnum(['Male', 'Female'], { message: 'Gender must be either Male or Female' })
  @IsNotEmpty({ message: 'Gender is required' })
  gender: string;

  @ApiPropertyOptional({ example: 'EMP-12345' })
  @IsString()
  @IsOptional()
  employee_number?: string;

  @ApiProperty({ example: 2, description: 'Position ID' })
  @IsInt({ message: 'Position ID must be an integer' })
  @IsNotEmpty({ message: 'Position ID is required' })
  position_id: number;
}
