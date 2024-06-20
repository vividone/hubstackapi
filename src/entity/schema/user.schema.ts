import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SuperAgent } from './super_agent_profile.schema';
import { Agent } from 'http';

export type UserDocument = HydratedDocument<Users>;

export enum Role {
    SUPER_ADMIN = 'physical',
    SUPER_AGENT ='virtual',
    AGENT = 'agent',
    INDIVIDUAL = 'individual'
  }
  

export
@Schema({ timestamps : true })
class Users {
    @Prop()
    first_name : string;

    @Prop()
    last_name : string;
    
    @Prop()
    username : string;

    @Prop()
    email : string;

    @Prop()
    password : string;

    @Prop()
    phone_number : string;

    @Prop()
    role : Role;

    @Prop()
    is_active : boolean;

    @Prop({ type: Types.ObjectId, ref: SuperAgent.name, required: true })
    super_agent: SuperAgent | Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Agent.name, required: true })
    agent: Agent | Types.ObjectId;

}

export const UserSchema = SchemaFactory.createForClass(Users)