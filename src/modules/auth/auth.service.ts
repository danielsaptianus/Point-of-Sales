import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { PasswordUtil } from '@common/utils/password.util';
import { LoginDto } from '@modules/auth/core/dto/login.dto';
import { RegisterDto } from '@modules/auth/core/dto/register.dto';
import { AuthResponseDto } from '@modules/auth/core/dto/auth-response.dto';
import { JwtPayload } from './core/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with employee, position, and permissions
    const user = await this.prisma.user.findUnique({
      where: { email },
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
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if employee profile is attached
    if (!user.employee) {
      throw new UnauthorizedException('Employee profile not found for this user account');
    }

    // Build permissions array
    const permissions = user.employee.position.position_permissions.map((pp) => pp.permission.name);

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      positionId: user.employee.position.id,
      positionName: user.employee.position.name,
      permissions,
    };

    const access_token = this.jwtService.sign(payload);

    // Record last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.employee.first_name,
        last_name: user.employee.last_name,
        position: {
          id: user.employee.position.id,
          name: user.employee.position.name,
        },
        permissions,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, first_name, last_name, gender, employee_number, position_id } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if employee_number is provided and already exists
    const empNum = employee_number || `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { employee_number: empNum },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee number already exists');
    }

    // Validate position exists
    const position = await this.prisma.position.findUnique({
      where: { id: position_id },
      include: {
        position_permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!position) {
      throw new BadRequestException('Invalid position ID');
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hash(password);

    // Create user and nested employee
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        employee: {
          create: {
            employee_number: empNum,
            first_name,
            last_name,
            gender,
            position_id,
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

    // Build permissions array
    const permissions = user.employee.position.position_permissions.map((pp) => pp.permission.name);

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      positionId: user.employee.position.id,
      positionName: user.employee.position.name,
      permissions,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.employee.first_name,
        last_name: user.employee.last_name,
        position: {
          id: user.employee.position.id,
          name: user.employee.position.name,
        },
        permissions,
      },
    };
  }
}
