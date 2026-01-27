import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('status') status?: OrderStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll({ status, search, page, limit });
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  /**
   * Upload screenshots for a single order item
   */
  @Post(':id/items/:itemId/screenshots')
  uploadItemScreenshots(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body()
    body: {
      screenshots: { front: string; back: string; left: string; right: string };
    },
  ) {
    return this.ordersService.uploadOrderItemScreenshots(
      orderId,
      itemId,
      body.screenshots,
    );
  }

  /**
   * Upload screenshots for multiple order items at once
   */
  @Post(':id/screenshots')
  uploadOrderScreenshots(
    @Param('id') orderId: string,
    @Body()
    body: {
      items: Array<{
        itemId: string;
        screenshots: {
          front: string;
          back: string;
          left: string;
          right: string;
        };
      }>;
    },
  ) {
    return this.ordersService.uploadOrderScreenshots(orderId, body.items);
  }
}
