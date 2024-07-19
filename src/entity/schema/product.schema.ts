import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Category } from './category.schema';
import { CostType } from 'src/enum';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = HydratedDocument<Product>;

export
@Schema({ timestamps: true })
class Product {
  @Prop({ required: true })
  @ApiProperty()
  name: string;

  @Prop({ enum: CostType, required: true })
  @ApiProperty()
  costType: CostType;

  @Prop({ type: Number, required: false, default: null })
  @ApiProperty()
  price: number | null;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  @ApiProperty()
  category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
