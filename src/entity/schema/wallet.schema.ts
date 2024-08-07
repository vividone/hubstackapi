import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type WalletDocument = HydratedDocument<Wallet>;

export
@Schema({ timestamps: true })
class Wallet {
  @Prop({ default: 0.0 })
  @ApiProperty()
  balance: number;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
