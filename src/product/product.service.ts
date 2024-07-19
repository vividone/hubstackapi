import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/entity/repositories/product.repo';
import { ProductDto } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
  ) {}

  async createProduct(createProductDto: ProductDto, categoryId: string) {
    const createdProduct = await this.productRepo.create({
      ...createProductDto,
      category: categoryId
    });
    return createdProduct;
  }

  async findAll() {
    const products = await this.productRepo.find()
    return products;
  }
}
