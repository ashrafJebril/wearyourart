import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import { SpacesService, ScreenshotUrls } from '../upload/spaces.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private spacesService: SpacesService,
  ) {}

  async findAll(query: {
    status?: OrderStatus;
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const { status, search, page = '1', limit = '20' } = query;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, images: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true, slug: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with number ${orderNumber} not found`,
      );
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    const orderNumber = this.generateOrderNumber();

    // Validate products exist and resolve slugs to UUIDs
    const resolvedItems: Array<{
      productId: string;
      quantity: number;
      color: string;
      size: string;
      price: number;
      customization?: any;
      isCustomized: boolean;
    }> = [];

    for (const item of createOrderDto.items) {
      // Try to find by UUID first, then by slug
      let product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        // Try finding by slug
        product = await this.prisma.product.findUnique({
          where: { slug: item.productId },
        });
      }

      if (!product) {
        throw new NotFoundException(
          `Product with ID or slug "${item.productId}" not found`,
        );
      }

      // Determine if this item is customized
      const isCustomized = !!(
        item.customization &&
        (item.customization.decalImage ||
          item.customization.textValue ||
          item.customization.backImage ||
          item.customization.backText ||
          item.customization.leftShoulderImage ||
          item.customization.leftShoulderText ||
          item.customization.rightShoulderImage ||
          item.customization.rightShoulderText)
      );

      resolvedItems.push({
        productId: product.id, // Use the actual UUID
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        price: item.price,
        customization: item.customization,
        isCustomized,
      });
    }

    return this.prisma.order.create({
      data: {
        orderNumber,
        customerName: createOrderDto.customerName,
        customerEmail: createOrderDto.customerEmail,
        shippingAddress: createOrderDto.shippingAddress as any,
        subtotal: createOrderDto.subtotal,
        shipping: createOrderDto.shipping,
        tax: createOrderDto.tax,
        total: createOrderDto.total,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            color: item.color,
            size: item.size,
            price: item.price,
            customization: item.customization || undefined,
            isCustomized: item.isCustomized,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true },
            },
          },
        },
      },
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    await this.findOne(id);

    return this.prisma.order.update({
      where: { id },
      data: { status: updateStatusDto.status },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true },
            },
          },
        },
      },
    });
  }

  async getStats() {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({ where: { status: 'DELIVERED' } }),
      this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: {
            notIn: ['CANCELLED'],
          },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: revenueResult._sum.total || 0,
    };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Upload screenshots for an order item and update the database
   */
  async uploadOrderItemScreenshots(
    orderId: string,
    itemId: string,
    screenshots: { front: string; back: string; left: string; right: string },
  ): Promise<ScreenshotUrls> {
    this.logger.log(`[uploadOrderItemScreenshots] Starting upload for order ${orderId}, item ${itemId}`);
    this.logger.log(`[uploadOrderItemScreenshots] Screenshot data sizes: front=${screenshots.front?.length || 0}, back=${screenshots.back?.length || 0}, left=${screenshots.left?.length || 0}, right=${screenshots.right?.length || 0}`);

    // Verify the order exists
    const order = await this.findOne(orderId);
    this.logger.log(`[uploadOrderItemScreenshots] Order found: ${order.orderNumber}`);

    // Verify the item belongs to this order
    const item = order.items.find((i) => i.id === itemId);
    if (!item) {
      this.logger.error(`[uploadOrderItemScreenshots] Item ${itemId} not found in order ${orderId}`);
      throw new NotFoundException(
        `Order item with ID ${itemId} not found in order ${orderId}`,
      );
    }

    // Find the item index for folder organization
    const itemIndex = order.items.findIndex((i) => i.id === itemId);
    this.logger.log(`[uploadOrderItemScreenshots] Item index: ${itemIndex}`);

    // Upload screenshots to DigitalOcean Spaces
    this.logger.log(`[uploadOrderItemScreenshots] Uploading to Spaces...`);
    const screenshotUrls = await this.spacesService.uploadOrderScreenshots(
      order.orderNumber,
      itemIndex,
      screenshots,
    );
    this.logger.log(`[uploadOrderItemScreenshots] Upload complete:`, screenshotUrls);

    // Update the order item with screenshot URLs
    this.logger.log(`[uploadOrderItemScreenshots] Updating database...`);
    await this.prisma.orderItem.update({
      where: { id: itemId },
      data: { screenshots: screenshotUrls as unknown as Prisma.InputJsonValue },
    });
    this.logger.log(`[uploadOrderItemScreenshots] Database updated successfully`);

    return screenshotUrls;
  }

  /**
   * Upload screenshots for multiple order items at once
   */
  async uploadOrderScreenshots(
    orderId: string,
    itemScreenshots: Array<{
      itemId: string;
      screenshots: { front: string; back: string; left: string; right: string };
    }>,
  ): Promise<Record<string, ScreenshotUrls>> {
    this.logger.log(`[uploadOrderScreenshots] Starting upload for order ${orderId}, ${itemScreenshots.length} items`);
    const results: Record<string, ScreenshotUrls> = {};

    for (const item of itemScreenshots) {
      this.logger.log(`[uploadOrderScreenshots] Processing item ${item.itemId}`);
      results[item.itemId] = await this.uploadOrderItemScreenshots(
        orderId,
        item.itemId,
        item.screenshots,
      );
    }

    this.logger.log(`[uploadOrderScreenshots] All uploads complete`);
    return results;
  }
}
