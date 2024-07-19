import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

export
@Schema({ timestamps: true })
class Product {
  @Prop()
  name: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
