import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type SuperAgentDocument = HydratedDocument<SuperAgent>;

export
@Schema({ timestamps: true })
class SuperAgent extends Users {
  @Prop()
  @ApiProperty()
  business_name: string;

  @Prop()
  @ApiProperty()
  region: string;

  @Prop()
  @ApiProperty()
  location: string;

  @Prop()
  @ApiProperty()
  is_verified: boolean;

  @Prop()
  @ApiProperty()
  superagent_username: string;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const SuperAgentSchema = SchemaFactory.createForClass(SuperAgent);
