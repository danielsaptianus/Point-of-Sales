import { UserResponseDto } from '@modules/users/core/dto/user-response.dto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { PasswordUtil } from '@common/utils/password.util';
import { CreateUserDto } from '@modules/users/core/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/core/dto/update-user.dto';
import { UserQueryDto } from '@modules/users/core/dto/user-query.dto';
import { UserTransformHelper } from './core/helpers/user-transform.helper';
import { PaginatedResponseDto } from '@common/dto/pagination.dto';
import { ResetEmployeePasswordDto } from './core/dto/reset-employee-password.dto';
import { CreateEmployeeUserDto } from './core/dto/create-employee-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, first_name, last_name, position_id, is_active } = createUserDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate position exists
    const position = await this.prisma.position.findUnique({
      where: { id: position_id },
    });

    if (!position) {
      throw new BadRequestException('Invalid position ID');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Generate unique employee_number
    const empNum = `EMP-USER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create user and nested employee
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        is_active: is_active ?? true,
        employee: {
          create: {
            employee_number: empNum,
            first_name,
            last_name,
            gender: 'Male', // default
            position_id,
            is_active: is_active ?? true,
          },
        },
      },
      include: {
        employee: {
          include: {
            position: {
              include: {
                position_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return UserTransformHelper.toEntity(user);
  }

  async findAll(query: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const { page = 1, limit = 10, search, is_active, position_id } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (search || position_id) {
      where.employee = {};
      if (search) {
        where.employee.OR = [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (position_id) {
        where.employee.position_id = position_id;
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: {
            include: {
              position: {
                include: {
                  position_permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    if (total === 0) {
      throw new NotFoundException('No users found');
    }

    return {
      data: UserTransformHelper.toEntities(users),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: {
        employee: {
          include: {
            position: {
              include: {
                position_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return UserTransformHelper.toEntity(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: { employee: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { email, password, first_name, last_name, is_active } = updateUserDto;

    // Check email uniqueness if changing email
    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await PasswordUtil.hash(password);
    }

    // Update user and optionally linked employee
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(is_active !== undefined && { is_active }),
        ...(user.employee &&
          (first_name || last_name) && {
            employee: {
              update: {
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
              },
            },
          }),
      },
      include: {
        employee: {
          include: {
            position: {
              include: {
                position_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return UserTransformHelper.toEntity(updatedUser);
  }

  async remove(id: number): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async resetEmployeePassword(adminId: number, dto: ResetEmployeePasswordDto): Promise<void> {
    const { employee_id, new_password, admin_password } = dto;

    // 1. Fetch admin user
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    // 2. Verify admin password
    const isPasswordValid = await PasswordUtil.compare(admin_password, admin.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid admin password');
    }

    // 3. Find employee and their linked user_id
    const employee = await this.prisma.employee.findUnique({
      where: { id: employee_id },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    if (!employee.user_id || !employee.user) {
      throw new BadRequestException('This employee does not have a linked user account');
    }

    // 4. Hash new password and update
    const hashedPassword = await PasswordUtil.hash(new_password);
    await this.prisma.user.update({
      where: { id: employee.user_id },
      data: { password: hashedPassword },
    });
  }

  async createEmployeeUser(adminId: number, dto: CreateEmployeeUserDto): Promise<UserResponseDto> {
    const { employee_id, email, new_password, admin_password } = dto;

    // 1. Fetch admin user
    const admin = await this.prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    // 2. Verify admin password
    const isPasswordValid = await PasswordUtil.compare(admin_password, admin.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid admin password');
    }

    // 3. Find employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: employee_id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employee_id} not found`);
    }

    if (employee.user_id) {
      throw new BadRequestException('This employee already has a linked user account');
    }

    // 4. Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already in use by another account');
    }

    // 5. Create user and link to employee
    const hashedPassword = await PasswordUtil.hash(new_password);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        is_active: true,
      },
    });

    await this.prisma.employee.update({
      where: { id: employee_id },
      data: { user_id: user.id },
    });

    return this.findOne(user.id);
  }
}
