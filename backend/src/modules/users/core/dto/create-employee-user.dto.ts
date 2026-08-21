import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateEmployeeUserDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  admin_password: string;
}
