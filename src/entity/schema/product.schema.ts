import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from './category.schema';
import { CostType } from 'src/enum';

export type ProductDocument = HydratedDocument<Product>;

export
@Schema({ timestamps: true })
class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ enum: CostType, required: true })
  costType: CostType;

  @Prop({ type: Number, required: false, default: null })
  price: number | null; 
  
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
