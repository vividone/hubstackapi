import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './product.dto';
import { ApiTags } from '@nestjs/swagger';
import { NinService } from './nin.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly ninService: NinService
  ) {}

  @ApiTags('Products')
  @Post('create-product/:productId')
  async createCategory(
    @Body() productDto: ProductDto,
    @Param('productId') productId: string,
  ) {
    return this.productService.createProduct(productDto, productId);
  }

  @Get('all-products')
  async findAll() {
    return this.productService.findAll();
  }

  @Post('/nin/validate')
  async validateNIN(@Body('nin') nin: string) {
    return await this.ninService.validateNIN(nin);
  }
}
