import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  first_name?: string;

  @ApiProperty({ required: false })
  last_name?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  birth_date?: string;

  @ApiPropertyOptional()
  marital_status?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  employee_number?: string;

  @ApiPropertyOptional()
  employment_type?: string;

  @ApiPropertyOptional()
  salary?: number;

  @ApiPropertyOptional()
  hire_date?: string;

  @ApiPropertyOptional()
  termination_date?: string;

  @ApiPropertyOptional()
  bank_name?: string;

  @ApiPropertyOptional()
  bank_account_number?: string;

  @ApiPropertyOptional()
  bank_account_name?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @Exclude()
  password: string;

  @ApiProperty()
  position_id?: number;

  @ApiProperty({ required: false })
  position?: any;

  @ApiProperty({ required: false })
  permissions?: string[];

  @ApiProperty({ required: false })
  deleted_at?: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
