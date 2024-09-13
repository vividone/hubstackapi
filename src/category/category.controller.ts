import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  BillerCategoriesDto,
  CategoryDto,
  InterswitchCategoryBillers,
} from './category.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { BillPaymentCategoryService } from './billpayment.category.service';

@ApiTags('Services')
@Controller('categories')
@UseGuards(ApiKeyGuard)
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly billPaymentCategoryService: BillPaymentCategoryService,
  ) {}

  @ApiOperation({ summary: 'get all categories' })
  @Get()
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @ApiOperation({ summary: 'get product by category' })
  @Get(':category')
  async getProductsByCategories(@Param('category') category: string) {
    return this.categoryService.getProductsByCategory(category);
  }

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
    return this.billPaymentCategoryService.getBillPaymentCategories();
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
    return this.billPaymentCategoryService.getBillers(billerCategoryId);
  }

  @ApiCreatedResponse({
    type: InterswitchCategoryBillers,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'List of services by biller' })
  @Get('billers/services/:billerId')
  async interswitchBillerServices(@Param('billerId') billerId: number) {
    return this.billPaymentCategoryService.getBillerServices(billerId);
  }
}
