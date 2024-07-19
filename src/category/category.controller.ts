import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryDto } from './category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create-category')
  async create(@Body() createProductDto: CategoryDto) {
    return this.categoryService.createCategory(createProductDto);
  }

  @Get('all-categories')
  async findAll() {
    return this.categoryService.getAllCategories();
  }
}
