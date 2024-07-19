import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Product, ProductDocument} from '../schema/products.schema'

@Global()
@Injectable()
export class ProductsRepository extends EntityRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) ProductModel: Model<ProductDocument>) {
    super(ProductModel);
  }
}
