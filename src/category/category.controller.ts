import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { BillerCategoriesDto, CategoryDto } from './category.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Categories')
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
  @Get('billers/:id')
  async interswitchBillerServices(@Param('id') categoryId: number) {
    return this.categoryService.getBillers(categoryId);
  }

  @ApiOperation({ summary: 'Authenticate Interswith' })
  @Get('auth')
  async authInterswith() {
    return this.categoryService.genISWAuthToken();
  }
}
