import { Injectable } from '@nestjs/common';
import { CategoryDto } from './category.dto';
import { CategoryRepository } from 'src/entity/repositories/category.repo';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async createCategory(categoryDto: CategoryDto) {
    const createdProduct = await this.categoryRepo.create({ ...categoryDto });
    return createdProduct;
  }

  async getAllCategories() {
    const categories = await this.categoryRepo.find();
    return categories;
  }
}
