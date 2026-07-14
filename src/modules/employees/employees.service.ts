import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeEntity> {
    const { email } = createEmployeeDto;

    // Check if email already exists
    const existingEmployee = await this.prisma.employee.findFirst({
      where: { email, deleted_at: null },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee with this email already exists');
    }

    const employee = await this.prisma.employee.create({
      data: createEmployeeDto,
    });

    return new EmployeeEntity(employee);
  }

  async findAll(): Promise<EmployeeEntity[]> {
    const employees = await this.prisma.employee.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });

    return employees.map((emp) => new EmployeeEntity(emp));
  }

  async findOne(id: number): Promise<EmployeeEntity> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return new EmployeeEntity(employee);
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeEntity> {
    // Check if employee exists
    await this.findOne(id);

    if (updateEmployeeDto.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: {
          email: updateEmployeeDto.email,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee with this email already exists');
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });

    return new EmployeeEntity(updatedEmployee);
  }

  async remove(id: number): Promise<void> {
    // Check if employee exists
    await this.findOne(id);

    await this.prisma.employee.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
