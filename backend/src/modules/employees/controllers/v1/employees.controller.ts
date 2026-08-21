import { Employee } from '@prisma/client';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiParam } from '@nestjs/swagger';
import { EmployeesService } from '../../employees.service';
import { CreateEmployeeDto } from '@modules/employees/core/dto/create-employee.dto';
import { UpdateEmployeeDto } from '@modules/employees/core/dto/update-employee.dto';
import { ChangePositionDto } from '@modules/employees/core/dto/change-position.dto';
import { ManagePermissionsDto } from '@modules/employees/core/dto/manage-permissions.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
} from '@common/decorators/api-response.decorator';

@ApiTags('Employees')
@ApiCookieAuth()
@Controller({ path: 'employees', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new employee (Admin only)' })
  @ApiSuccessResponse(CreateEmployeeDto)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<any> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @Roles('Admin', 'Staff Kasir', 'Staff Gudang')
  @ApiOperation({ summary: 'Get all employees (Admin & Staff)' })
  @ApiSuccessArrayResponse(CreateEmployeeDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(): Promise<any[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Staff Kasir', 'Staff Gudang')
  @ApiOperation({ summary: 'Get employee by ID (Admin & Staff)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateEmployeeDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update employee details (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateEmployeeDto)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<any> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee (soft delete - Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires Admin role' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.employeesService.remove(id);
  }

  @Patch(':id/position')
  @Roles('Admin')
  @ApiOperation({ summary: 'Change employee position/role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateEmployeeDto)
  async changePosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePositionDto: ChangePositionDto,
  ): Promise<any> {
    return this.employeesService.changePosition(id, changePositionDto);
  }

  @Post(':id/permissions/assign')
  @Roles('Admin')
  @ApiOperation({ summary: 'Assign permissions to employee position' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateEmployeeDto)
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() managePermissionsDto: ManagePermissionsDto,
  ): Promise<any> {
    return this.employeesService.assignPermissions(id, managePermissionsDto);
  }

  @Post(':id/permissions/revoke')
  @Roles('Admin')
  @ApiOperation({ summary: 'Revoke permissions from employee position' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateEmployeeDto)
  async revokePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() managePermissionsDto: ManagePermissionsDto,
  ): Promise<any> {
    return this.employeesService.revokePermissions(id, managePermissionsDto);
  }
}
