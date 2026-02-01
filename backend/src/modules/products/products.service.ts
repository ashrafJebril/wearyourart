import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    category?: string;
    subcategory?: string;
    inStock?: string;
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const { category, subcategory, inStock, search, page = '1', limit = '20' } = query;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = { slug: category };
    }

    if (subcategory) {
      where.subcategory = { slug: subcategory };
    }

    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          subcategory: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const slug = this.generateSlug(createProductDto.name);

    const existingProduct = await this.prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      throw new ConflictException('Product with this name already exists');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    // Validate subcategory belongs to category if provided
    if (createProductDto.subcategoryId) {
      const subcategory = await this.prisma.subcategory.findUnique({
        where: { id: createProductDto.subcategoryId },
      });

      if (!subcategory) {
        throw new NotFoundException(
          `Subcategory with ID ${createProductDto.subcategoryId} not found`,
        );
      }

      if (subcategory.categoryId !== createProductDto.categoryId) {
        throw new ConflictException(
          'Subcategory does not belong to the selected category',
        );
      }
    }

    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        slug,
        description: createProductDto.description,
        basePrice: createProductDto.basePrice,
        customizationPrice: createProductDto.customizationPrice || 0,
        images: createProductDto.images || [],
        colors: createProductDto.colors || [],
        colorImages: createProductDto.colorImages || {},
        sizes: createProductDto.sizes || [],
        features: createProductDto.features || [],
        categoryId: createProductDto.categoryId,
        subcategoryId: createProductDto.subcategoryId || null,
        inStock: createProductDto.inStock ?? true,
        customizable: createProductDto.customizable ?? true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.findOne(id);

    const data: any = { ...updateProductDto };

    if (updateProductDto.name) {
      data.slug = this.generateSlug(updateProductDto.name);

      const duplicateProduct = await this.prisma.product.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      });

      if (duplicateProduct) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }
    }

    // Validate subcategory belongs to category if provided
    if (updateProductDto.subcategoryId !== undefined) {
      if (updateProductDto.subcategoryId === null || updateProductDto.subcategoryId === '') {
        data.subcategoryId = null;
      } else {
        const subcategory = await this.prisma.subcategory.findUnique({
          where: { id: updateProductDto.subcategoryId },
        });

        if (!subcategory) {
          throw new NotFoundException(
            `Subcategory with ID ${updateProductDto.subcategoryId} not found`,
          );
        }

        const categoryId = updateProductDto.categoryId || existingProduct.categoryId;
        if (subcategory.categoryId !== categoryId) {
          throw new ConflictException(
            'Subcategory does not belong to the selected category',
          );
        }
      }
    }

    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        subcategory: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if product has any order items
    const orderItemCount = await this.prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemCount > 0) {
      throw new ConflictException(
        `Cannot delete product: it is referenced by ${orderItemCount} order(s). Please delete or reassign those orders first.`,
      );
    }

    return this.prisma.product.delete({
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
