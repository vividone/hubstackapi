import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type MockWalletDocument = HydratedDocument<MockWallet>;

export
@Schema({ timestamps: true })
class MockWallet {
  @Prop()
  @ApiProperty()
  accountName: string;

  @Prop()
  @ApiProperty()
  customer_id: number;

  @Prop()
  @ApiProperty()
  customerCode: string;

  @Prop()
  @ApiProperty()
  accountNumber: string;

  @Prop()
  @ApiProperty()
  accountReference: string;

  @Prop()
  @ApiProperty()
  bankName: string;

  @Prop()
  @ApiProperty()
  bankCode: string;

  @Prop({ default: 'NG' })
  @ApiProperty()
  country: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const MockWalletSchema = SchemaFactory.createForClass(MockWallet);
