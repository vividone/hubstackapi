import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';

export type WalletDocument = HydratedDocument<Wallet>;

export
@Schema({ timestamps: true })
class Wallet extends Users {
  @Prop()
  accountName: string;

  @Prop()
  accountNumber: string;

  @Prop()
  accountReference: string;

  @Prop()
  bankName: string;

  @Prop()
  bankCode: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  user: Users | Types.ObjectId;

}


export const WalletSchema = SchemaFactory.createForClass(Wallet);
