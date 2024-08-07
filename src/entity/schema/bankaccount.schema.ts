import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type BankAccountDocument = HydratedDocument<BankAccount>;

export
@Schema({ timestamps: true })
class BankAccount {
  @Prop()
  @ApiProperty()
  accountName: string;

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
  bank_slug: string;

  @Prop()
  @ApiProperty()
  provider: string;

  @Prop()
  @ApiProperty()
  bankCode: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
