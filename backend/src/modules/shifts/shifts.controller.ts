import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { OpenShiftDto } from './core/dto/open-shift.dto';
import { CloseShiftDto } from './core/dto/close-shift.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { GetUser } from '@common/decorators/get-user.decorator';

@ApiTags('Shifts')
@ApiCookieAuth()
@Controller({ path: 'shifts', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('open')
  @Roles('Admin', 'Staff Kasir')
  @ApiOperation({ summary: 'Open a new cashier shift' })
  openShift(@GetUser('userId') userId: number, @Body() openShiftDto: OpenShiftDto) {
    return this.shiftsService.openShift(userId, openShiftDto);
  }

  @Post('close')
  @Roles('Admin', 'Staff Kasir')
  @ApiOperation({ summary: 'Close current cashier shift' })
  closeShift(@GetUser('userId') userId: number, @Body() closeShiftDto: CloseShiftDto) {
    return this.shiftsService.closeShift(userId, closeShiftDto);
  }

  @Get('current')
  @Roles('Admin', 'Staff Kasir')
  @ApiOperation({ summary: 'Get current open shift for user' })
  getCurrentShift(@GetUser('userId') userId: number) {
    return this.shiftsService.getCurrentShift(userId);
  }

  @Get()
  @Roles('Admin')
  @ApiOperation({ summary: 'Get all shifts (Admin only)' })
  findAll() {
    return this.shiftsService.findAll();
  }
}
