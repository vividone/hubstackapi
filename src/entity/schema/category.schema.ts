import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

export
@Schema({ timestamps: true })
class Category {
  @Prop()
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
