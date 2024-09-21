import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from './user.schema';

export type TransactionDocument = HydratedDocument<Transaction>;
export
@Schema()
class Transaction {
  @Prop({ required: true })
  @ApiProperty()
  amount: number;

  @ApiProperty()
  @Prop({ required: true })
  transactionReference: string;

  @Prop()
  @ApiProperty()
  transactionType: string;

  @ApiProperty()
  @Prop()
  transactionStatus: string;

  @ApiProperty()
  @Prop({ type: Object })
  transactionDetails: object;

  @ApiProperty()
  @Prop({ default: false })
  manualVerify: boolean;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;

  @ApiProperty()
  createdAt: Date; 

  @ApiProperty()
  updatedAt: Date; 
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
