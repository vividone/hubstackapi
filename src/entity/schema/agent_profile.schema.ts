import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type AgentDocument = HydratedDocument<Agent>;

export
@Schema({ timestamps: true })
class Agent extends Users {
  @Prop()
  @ApiProperty()
  business_name: string;

  @Prop()
  @ApiProperty()
  CAC: string;

  @Prop()
  @ApiProperty()
  region: string;

  @Prop()
  @ApiProperty()
  location: string;

  @Prop({ default: 'Pending' })
  @ApiProperty()
  kyc: string;

  @Prop({ default: false })
  @ApiProperty()
  agentVerified: boolean;

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
