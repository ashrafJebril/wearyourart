import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};

    return this.prisma.subcategory.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(`Subcategory with ID ${id} not found`);
    }

    return subcategory;
  }

  async findBySlug(categorySlug: string, subcategorySlug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with slug ${categorySlug} not found`,
      );
    }

    const subcategory = await this.prisma.subcategory.findFirst({
      where: {
        slug: subcategorySlug,
        categoryId: category.id,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!subcategory) {
      throw new NotFoundException(
        `Subcategory with slug ${subcategorySlug} not found in category ${categorySlug}`,
      );
    }

    return subcategory;
  }

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    const { categoryId, name } = createSubcategoryDto;
    const slug = this.generateSlug(name);

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Check uniqueness within category
    const existing = await this.prisma.subcategory.findFirst({
      where: {
        categoryId,
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Subcategory with this name already exists in this category',
      );
    }

    return this.prisma.subcategory.create({
      data: {
        ...createSubcategoryDto,
        slug,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async update(id: string, updateSubcategoryDto: UpdateSubcategoryDto) {
    const existing = await this.findOne(id);
    const data: any = { ...updateSubcategoryDto };

    // If changing category, verify new category exists
    if (updateSubcategoryDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateSubcategoryDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateSubcategoryDto.categoryId} not found`,
        );
      }
    }

    if (updateSubcategoryDto.name) {
      data.slug = this.generateSlug(updateSubcategoryDto.name);

      const categoryId = updateSubcategoryDto.categoryId || existing.category.id;

      const duplicate = await this.prisma.subcategory.findFirst({
        where: {
          categoryId,
          OR: [{ name: updateSubcategoryDto.name }, { slug: data.slug }],
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          'Subcategory with this name already exists in this category',
        );
      }
    }

    return this.prisma.subcategory.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Products with this subcategory will have subcategoryId set to null (onDelete: SetNull)
    return this.prisma.subcategory.delete({
      where: { id },
    });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
