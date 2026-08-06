import { Category } from '@prisma/client';
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
import { CategoriesService } from '../../categories.service';
import { CreateCategoryDto } from '@modules/categories/core/dto/create-category.dto';
import { UpdateCategoryDto } from '@modules/categories/core/dto/update-category.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import {
  ApiSuccessResponse,
  ApiSuccessArrayResponse,
} from '@common/decorators/api-response.decorator';

@ApiTags('Categories')
@ApiCookieAuth()
@Controller({ path: 'categories', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new product category (Admin only)' })
  @ApiSuccessResponse(CreateCategoryDto)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<any> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get all categories (Admin & Staff)' })
  @ApiSuccessArrayResponse(CreateCategoryDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(): Promise<any[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Roles('Admin', 'Staff')
  @ApiOperation({ summary: 'Get category by ID (Admin & Staff)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateCategoryDto)
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update category (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(CreateCategoryDto)
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name already exists' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<any> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles('Admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category (soft delete - Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
