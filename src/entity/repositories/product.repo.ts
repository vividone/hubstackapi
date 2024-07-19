import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { ProductDocument, Product } from '../schema/product.schema';

@Global()
@Injectable()
export class ProductRepository extends EntityRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) ProductModel: Model<ProductDocument>) {
    super(ProductModel);
  }
}
