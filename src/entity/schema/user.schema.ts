import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/enum';

export type UserDocument = HydratedDocument<Users>;

export
@Schema({ timestamps: true, discriminatorKey: 'role' })
class Users {
  @Prop()
  firstname: string;

  @Prop()
  lastname: string;

  @Prop()
  username: string;

  @Prop({ unique: true})
  email: string;

  @Prop()
  password: string;

  @Prop()
  phone_number: string;

  @Prop()
  role: Role;

  @Prop()
  otp: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  is_active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(Users);

UserSchema.pre<UserDocument>('save', async function (next) {
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

UserSchema.methods.comparePassword = async function (
  userPassword: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    return false;
  }
};
