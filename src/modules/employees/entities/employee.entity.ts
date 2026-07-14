import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Employee as PrismaEmployee } from '@prisma/client';

export class EmployeeEntity implements Partial<PrismaEmployee> {
  @ApiProperty()
  id: number;

  @ApiProperty()
  first_name: string;

  @ApiProperty()
  last_name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional()
  deleted_at: Date | null;

  constructor(partial: Partial<EmployeeEntity>) {
    Object.assign(this, partial);
  }
}
