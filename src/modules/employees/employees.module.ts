import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './controllers/v1/employees.controller';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService],
})
export class EmployeesModule {}
