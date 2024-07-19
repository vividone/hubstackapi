import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';

export type MockWalletDocument = HydratedDocument<MockWallet>;

export
@Schema({ timestamps: true })
class MockWallet {
  @Prop()
  accountName: string;

  @Prop()
  customer_id: number;

  @Prop()
  customerCode: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountReference: string;

  @Prop()
  bankName: string;

  @Prop()
  bankCode: string;

  @Prop({ default: 'NG' })
  country: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  user: Users | Types.ObjectId;
}

export const MockWalletSchema = SchemaFactory.createForClass(MockWallet);
