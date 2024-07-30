import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Users } from './user.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

export
@Schema({ timestamps: true })
class Transaction {
  @Prop()
  @ApiProperty()
  amount: number;

  @ApiProperty()
  @Prop()
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

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
