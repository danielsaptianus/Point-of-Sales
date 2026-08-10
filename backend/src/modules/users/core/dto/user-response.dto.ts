import { ApiProperty } from '@nestjs/swagger';
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
