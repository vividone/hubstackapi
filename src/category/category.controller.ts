import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  BillerCategoriesDto,
  CategoryDto,
  InterswitchCategoryBillers,
} from './category.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Services')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiCreatedResponse({ type: CategoryDto, description: 'expected response' })
  @ApiOperation({ summary: 'Create biller category' })
  @Post('create-category')
  async createCategory(@Body() createProductDto: CategoryDto) {
    return this.categoryService.createCategory(createProductDto);
  }

  @ApiCreatedResponse({
    type: BillerCategoriesDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'List of bill payment categories' })
  @Get('billpayments')
  async billpaymentCategories() {
    return this.categoryService.getBillPaymentCategories();
  }

  @ApiCreatedResponse({
    type: BillerCategoriesDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'List of Interswitch billers by category' })
  @Get('billers/:billerCategoryId')
  async interswitchBillerCategories(
    @Param('billerCategoryId') billerCategoryId: number,
  ) {
    return this.categoryService.getBillers(billerCategoryId);
  }

  @ApiCreatedResponse({
    type: InterswitchCategoryBillers,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'List of services by biller' })
  @Get('billers/services/:billerId')
  async interswitchBillerServices(@Param('billerId') billerId: number) {
    return this.categoryService.getBillerServices(billerId);
  }
}
