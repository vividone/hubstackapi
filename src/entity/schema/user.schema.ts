import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/enum';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = HydratedDocument<Users>;

export
@Schema({ timestamps: true, discriminatorKey: 'role' })
class Users {
  @Prop()
  @ApiProperty()
  firstname: string;

  @Prop()
  @ApiProperty()
  lastname: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  @ApiProperty()
  password: string;

  @Prop()
  @ApiProperty()
  phone_number: string;

  @Prop()
  @ApiProperty()
  role: Role;

  @Prop()
  @ApiProperty()
  otp: string;

  @Prop()
  otpExpiry: Date;

  @Prop({ default: false })
  isOtpVerified: boolean;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  @ApiProperty()
  unitBalance: number;

  @Prop()
  @ApiProperty()
  is_active: boolean;

  @Prop()
  @ApiProperty()
  referralCode: string;

  @Prop({ default: 0 })
  @ApiProperty()
  referralCount: number;

  @Prop({ default: 'Steel' })
  @ApiProperty()
  referralLevel: string;

  @Prop()
  @ApiProperty()
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(Users);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (this.password.startsWith('$2a$')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    return false;
  }
};
