import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SuperAgent } from './super_agent_profile.schema';
import * as bcrypt from 'bcryptjs'
import { Agent } from './agent_profile.schema';
import { Role } from 'src/enum';

export type UserDocument = HydratedDocument<Users>;

export
@Schema({ timestamps : true, discriminatorKey: 'role' })
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

export const UserSchema = SchemaFactory.createForClass(Users)

UserSchema.pre<UserDocument>('save', async function(next) {
    if (!this.isModified('password')) {
      return next();
    }
  
    try {
      const hashedPassword = await bcrypt.hash(this.password, 10); 
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });

  UserSchema.methods.comparePassword = async function(userPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(userPassword, this.password);
    } catch (error) {
      return false;
    }
  };