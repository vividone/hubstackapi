import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from './products.schema';

export type CategoryDocument = HydratedDocument<Category>;

export
@Schema({ timestamps: true })
class Category {
  @Prop()
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop()
  price: number; 
}

export const CategorySchema = SchemaFactory.createForClass(Category);
