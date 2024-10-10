import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProductService } from './product.service';
import { NinDataDto, ProductDto } from './product.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NinService } from './nin.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly ninService: NinService,
  ) {}

    @ApiTags('Products')
    @Post('create-product/:category')
    async createCategory(
      @Body() productDto: ProductDto,
      @Param('category') category: string,
    ) {
      return this.productService.createProduct(productDto, category);
    }

  //   @ApiTags('Products')
  //   @ApiOperation({ summary: 'Get all products' })
  //   @Get('all-products')
  //   async findAll() {
  //     return this.productService.findAll();
  //   }

  //   @ApiTags('Products')
  //   @ApiCreatedResponse({
  //     type: NinDto,
  //     description: 'expected response',
  //   })
  //   @ApiOperation({ summary: 'Validate NIN number' })
  //   @Post('/nin/validate-nin')
  //   async validateNIN(@Body() nin: NinDto) {
  //     return await this.ninService.validateNIN(nin);
  //   }

  //   @ApiTags('Products')
  //   @ApiCreatedResponse({
  //     type: NinDto,
  //     description: 'expected response',
  //   })
  //   @ApiOperation({ summary: 'Validate Virtual NIN number' })
  //   @Post('/nin/validate-virtual-nin')
  //   async validateVNIN(@Body() nin: NinDto) {
  //     return await this.ninService.validateVirtualNIN(nin);
  //   }

  //   @ApiTags('Products')
  //   @ApiCreatedResponse({
  //     type: NinDto,
  //     description: 'expected response',
  //   })
  //   @ApiOperation({ summary: 'Get NIN Number' })
  //   @Post('/nin/get-nin')
  //   async getNIN(@Body() ninDataDto: NinDataDto) {
  //     return await this.ninService.getNIN(ninDataDto)
  //   }
}
