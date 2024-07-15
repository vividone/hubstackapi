import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepository) {}

  async findOne(id: string) {
    const user = await this.userRepo.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAll() {
    const user = await this.userRepo.find();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserRoles(userId: string) {
    const user = await this.userRepo.findOne({ _id: userId });
    if (!user) {
      throw new NotFoundException('get user roles: User not found');
    }
    return [user.role];
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userRepo.findOneAndUpdate({ _id: userId }, { refreshToken });
  }

  private async findUserByEmail(email: string) {
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async saveOtpToUser(email: string, otp: string) {
    const user = await this.findUserByEmail(email);
    user.otp = otp;
    user.isVerified = false;
    await user.save();
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return await this.updateUser(user);
  }

  async updateUserProfile(id: string, updateUserDto: CreateUserDto) {
    const { email,firstname, lastname, password, role, ...otherFields } = updateUserDto;

    if (email) {
      const existingUser = await this.userRepo.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData = { ...otherFields };

    const updatedUser = await this.userRepo.findOneAndUpdate(
      { _id: id, role: 'Individual' },
      { $set: updateData },
    );

    return {
      status: 'Success',
      message: 'User profile updated successfully',
      user: updatedUser,
    };
  }

  private async updateUser(user: UserRepository){
    return await this.userRepo.create(user);
  }
}
