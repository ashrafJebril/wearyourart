import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subcategories')
export class SubcategoriesController {
  constructor(private subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.subcategoriesService.findAll(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Get('slug/:categorySlug/:subcategorySlug')
  findBySlug(
    @Param('categorySlug') categorySlug: string,
    @Param('subcategorySlug') subcategorySlug: string,
  ) {
    return this.subcategoriesService.findBySlug(categorySlug, subcategorySlug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.subcategoriesService.update(id, updateSubcategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(id);
  }
}
