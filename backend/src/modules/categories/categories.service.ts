import { Category } from '@prisma/client';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateCategoryDto } from '@modules/categories/core/dto/create-category.dto';
import { UpdateCategoryDto } from '@modules/categories/core/dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private transformCategory(cat: any) {
    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
    };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    const { name } = createCategoryDto;

    const existingCategory = await this.prisma.category.findFirst({
      where: { name, deleted_at: null },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists');
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return this.transformCategory(category);
  }

  async findAll(): Promise<any[]> {
    const categories = await this.prisma.category.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });

    return categories.map((cat) => this.transformCategory(cat));
  }

  async findOne(id: number): Promise<any> {
    const category = await this.prisma.category.findFirst({
      where: { id, deleted_at: null },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.transformCategory(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    await this.findOne(id);

    if (updateCategoryDto.name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name: updateCategoryDto.name,
          id: { not: id },
          deleted_at: null,
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return this.transformCategory(updatedCategory);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.category.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }
}
