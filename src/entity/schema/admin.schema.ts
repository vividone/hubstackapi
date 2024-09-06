import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';
import { ApiProperty } from '@nestjs/swagger';

export type AdminDocument = HydratedDocument<Admin>;

export
@Schema({ timestamps: true })
class Admin extends Users {

  @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
  @ApiProperty()
  user: Users | Types.ObjectId;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
