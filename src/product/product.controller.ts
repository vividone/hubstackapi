import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto } from './product.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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
}
