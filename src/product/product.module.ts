import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from 'src/entity/repositories/product.repo';
import { Product, ProductSchema } from 'src/entity/schema/product.schema';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { NinService } from './nin.service';

@Module({
  providers: [ProductService, NinService, ProductRepository],
  controllers: [ProductController],
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [ProductService, ProductRepository, NinService],
})
export class ProductModule {}
