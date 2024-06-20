import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

}