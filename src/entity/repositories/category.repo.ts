import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Category, CategoryDocument } from '../schema/category.schema';

@Global()
@Injectable()
export class CategoryRepository extends EntityRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) CategoryModel: Model<CategoryDocument>,
  ) {
    super(CategoryModel);
  }
}
