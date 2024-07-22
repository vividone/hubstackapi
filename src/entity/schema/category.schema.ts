import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

export enum CategoryType {
  NIN = 'nin',
  BillPayment = 'billpayment',
}

export
@Schema({ timestamps: true })
class Category {
  @Prop()
  @ApiProperty()
  name: string;

  @ApiProperty()
  @Prop()
  categoryType: CategoryType;

  @ApiProperty()
  @Prop()
  billerCategoryId: number;

  @ApiProperty()
  @Prop()
  partnerProvider: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
