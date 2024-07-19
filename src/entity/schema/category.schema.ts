import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

export
@Schema({ timestamps: true })
class Category {
  @Prop()
  @ApiProperty()
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
