import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employee as PrismaEmployee, Position, User } from '@prisma/client';

export class EmployeeEntity implements Partial<PrismaEmployee> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  employee_number: string;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  gender: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  address: string | null;

  @ApiPropertyOptional()
  hire_date: Date | null;

  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional()
  user_id: number | null;

  @ApiProperty()
  position_id: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at: Date | null;

  @ApiPropertyOptional()
  position?: Partial<Position>;

  @ApiPropertyOptional()
  user?: Partial<User>;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
