import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../auth.service';
import { LoginDto } from '@modules/auth/core/dto/login.dto';
import { RegisterDto } from '@modules/auth/core/dto/register.dto';
import { AuthResponseDto } from '@modules/auth/core/dto/auth-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { ApiSuccessResponse } from '@common/decorators/api-response.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { PermissionsGuard } from '@common/guards/permissions.guard';
import { GetUser } from '@common/decorators/get-user.decorator';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiSuccessResponse(AuthResponseDto)
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<any> {
    const { access_token, user } = await this.authService.login(loginDto);
    res.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { user };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiSuccessResponse(AuthResponseDto)
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const { access_token, user } = await this.authService.register(registerDto);
    res.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('Authentication', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    });
    return { message: 'Logout successful' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiSuccessResponse(AuthResponseDto)
  async getProfile(@GetUser('userId') userId: number): Promise<any> {
    return this.authService.getProfile(userId);
  }
}
