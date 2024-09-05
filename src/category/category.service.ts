import { Injectable } from '@nestjs/common';
import { CategoryDto } from './category.dto';
import { CategoryRepository } from 'src/entity/repositories/category.repo';
import axios from 'axios';
import { ProductRepository } from 'src/entity/repositories/product.repo';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async createCategory(categoryDto: CategoryDto) {
    try {
      const createdProduct = await this.categoryRepo.create({ ...categoryDto });
      return createdProduct;
    } catch (error) {
      throw new Error('Error creating new category or category already exists');
    }
  }

  async getCategories (){
    const categories = this.categoryRepo.find();
    return categories;
  }

  async getProductsByCategory(category: string){
    const products = this.productRepo.find({category: category});
    return products;
  }

}
