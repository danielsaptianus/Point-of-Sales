import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeEntity } from './entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<EmployeeEntity> {
    const { employee_number, position_id, user_id, hire_date, ...rest } = createEmployeeDto;

    // Check unique employee_number
    const existingNum = await this.prisma.employee.findUnique({
      where: { employee_number },
    });

    if (existingNum) {
      throw new ConflictException('Employee number (NIP) already exists');
    }

    // Check position exists
    const position = await this.prisma.position.findUnique({
      where: { id: position_id },
    });

    if (!position) {
      throw new BadRequestException('Invalid position ID');
    }

    // Check user_id if provided
    if (user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new BadRequestException('Invalid user ID');
      }

      // Check user_id uniqueness on Employee (1-to-1 relation)
      const linkedEmployee = await this.prisma.employee.findUnique({
        where: { user_id },
      });

      if (linkedEmployee) {
        throw new ConflictException('User is already linked to another employee');
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        employee_number,
        position_id,
        user_id,
        hire_date: hire_date ? new Date(hire_date) : null,
        ...rest,
      },
      include: { position: true, user: true },
    });

    return new EmployeeEntity(employee);
  }

  async findAll(): Promise<EmployeeEntity[]> {
    const employees = await this.prisma.employee.findMany({
      where: { deleted_at: null },
      include: { position: true, user: true },
      orderBy: { created_at: 'desc' },
    });

    return employees.map((emp) => new EmployeeEntity(emp));
  }

  async findOne(id: number): Promise<EmployeeEntity> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
      include: { position: true, user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return new EmployeeEntity(employee);
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<EmployeeEntity> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const { employee_number, position_id, user_id, hire_date, ...rest } = updateEmployeeDto;

    // Check unique employee_number if changing
    if (employee_number && employee_number !== employee.employee_number) {
      const existingNum = await this.prisma.employee.findUnique({
        where: { employee_number },
      });

      if (existingNum) {
        throw new ConflictException('Employee number (NIP) already exists');
      }
    }

    // Check position exists if changing
    if (position_id && position_id !== employee.position_id) {
      const position = await this.prisma.position.findUnique({
        where: { id: position_id },
      });

      if (!position) {
        throw new BadRequestException('Invalid position ID');
      }
    }

    // Check user_id if changing
    if (user_id && user_id !== employee.user_id) {
      const user = await this.prisma.user.findUnique({
        where: { id: user_id },
      });

      if (!user) {
        throw new BadRequestException('Invalid user ID');
      }

      // Check user_id uniqueness on Employee (1-to-1 relation)
      const linkedEmployee = await this.prisma.employee.findUnique({
        where: { user_id },
      });

      if (linkedEmployee) {
        throw new ConflictException('User is already linked to another employee');
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(employee_number && { employee_number }),
        ...(position_id && { position_id }),
        ...(user_id !== undefined && { user_id }),
        ...(hire_date && { hire_date: new Date(hire_date) }),
        ...rest,
      },
      include: { position: true, user: true },
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
