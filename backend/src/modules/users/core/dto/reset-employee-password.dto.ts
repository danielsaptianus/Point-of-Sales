import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class ResetEmployeePasswordDto {
  @ApiProperty({ description: 'The ID of the employee whose password is being reset', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  employee_id: number;

  @ApiProperty({ description: 'The new password for the employee', example: 'newpassword123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  new_password: string;

  @ApiProperty({ description: 'The current password of the admin performing the action', example: 'adminpassword123' })
  @IsString()
  @IsNotEmpty()
  admin_password: string;
}
