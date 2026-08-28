import { Employee } from '@prisma/client';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateEmployeeDto } from '@modules/employees/core/dto/create-employee.dto';
import { UpdateEmployeeDto } from '@modules/employees/core/dto/update-employee.dto';
import { ChangePositionDto } from '@modules/employees/core/dto/change-position.dto';
import { ManagePermissionsDto } from '@modules/employees/core/dto/manage-permissions.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  private transformEmployee(emp: any) {
    return {
      id: emp.id,
      employee_number: emp.employee_number,
      first_name: emp.first_name,
      last_name: emp.last_name,
      gender: emp.gender,
      birth_date: emp.birth_date,
      marital_status: emp.marital_status,
      email: emp.email,
      phone: emp.phone,
      address: emp.address,
      hire_date: emp.hire_date,
      termination_date: emp.termination_date,
      employment_type: emp.employment_type,
      salary: emp.salary,
      bank_name: emp.bank_name,
      bank_account_number: emp.bank_account_number,
      bank_account_name: emp.bank_account_name,
      is_active: emp.is_active,
      position_id: emp.position_id,
      position: emp.position
        ? {
            id: emp.position.id,
            name: emp.position.name,
          }
        : null,
      user_id: emp.user_id,
      user: emp.user
        ? {
            id: emp.user.id,
            email: emp.user.email,
          }
        : null,
    };
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<any> {
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
        birth_date: rest.birth_date ? new Date(rest.birth_date) : null,
        termination_date: rest.termination_date ? new Date(rest.termination_date) : null,
        ...rest,
      } as any, // Cast to any to bypass complex prisma type checking if needed, or let it infer
      include: { position: true, user: true },
    });

    return this.transformEmployee(employee);
  }

  async getPositions(): Promise<any[]> {
    return this.prisma.position.findMany();
  }

  async findAll(): Promise<any[]> {
    const employees = await this.prisma.employee.findMany({
      where: { deleted_at: null },
      include: { position: true, user: true },
      orderBy: { created_at: 'desc' },
    });

    return employees.map((emp) => this.transformEmployee(emp));
  }

  async findOne(id: number): Promise<any> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
      include: { position: true, user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.transformEmployee(employee);
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<any> {
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
        ...(rest.birth_date && { birth_date: new Date(rest.birth_date) }),
        ...(rest.termination_date && { termination_date: new Date(rest.termination_date) }),
        ...rest,
      } as any,
      include: { position: true, user: true },
    });

    return this.transformEmployee(updatedEmployee);
  }

  async remove(id: number): Promise<void> {
    // Check if employee exists
    await this.findOne(id);

    await this.prisma.employee.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async changePosition(id: number, changePositionDto: ChangePositionDto): Promise<any> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Validate position exists
    const position = await this.prisma.position.findUnique({
      where: { id: changePositionDto.position_id },
    });

    if (!position) {
      throw new BadRequestException('Invalid position ID');
    }

    // Update position in Employee model
    await this.prisma.employee.update({
      where: { id },
      data: { position_id: changePositionDto.position_id },
    });

    return this.findOne(id);
  }

  async assignPermissions(
    id: number,
    managePermissionsDto: ManagePermissionsDto,
  ): Promise<any> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Validate all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: managePermissionsDto.permissions } },
    });

    if (permissions.length !== managePermissionsDto.permissions.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }

    // Get current permissions for the position
    const currentPermissions = await this.prisma.positionPermission.findMany({
      where: { position_id: employee.position_id },
    });

    const currentPermissionIds = currentPermissions.map((pp) => pp.permission_id);
    const newPermissionIds = permissions.map((p) => p.id);

    // Find permissions to add
    const permissionsToAdd = newPermissionIds.filter((pid) => !currentPermissionIds.includes(pid));

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      await this.prisma.positionPermission.createMany({
        data: permissionsToAdd.map((permission_id) => ({
          position_id: employee.position_id,
          permission_id,
        })),
        skipDuplicates: true,
      });
    }

    // Return updated employee
    return this.findOne(id);
  }

  async revokePermissions(
    id: number,
    managePermissionsDto: ManagePermissionsDto,
  ): Promise<any> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deleted_at: null },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Validate all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: managePermissionsDto.permissions } },
    });

    if (permissions.length !== managePermissionsDto.permissions.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }

    const permissionIds = permissions.map((p) => p.id);

    // Remove permissions
    await this.prisma.positionPermission.deleteMany({
      where: {
        position_id: employee.position_id,
        permission_id: { in: permissionIds },
      },
    });

    // Return updated employee
    return this.findOne(id);
  }
}
