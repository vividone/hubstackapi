/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { CreateUserDto } from './users.dto';
import * as bcrypt from 'bcryptjs';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly agentRepo: AgentProfileRepository,
  ) {}

  async findUserById(id: string) {
    const user = await this.userRepo.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === 'Individual') {
      return user;
    } else if (user.role === 'Agent') {
      const agentProfile = await this.agentRepo.findOne({ user: user._id });
      return agentProfile;
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

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.findUserById(userId);
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

  async updateUserProfile(e_mail: string, updateUserDto: CreateUserDto) {
    const { email, firstname, lastname, password, role, ...otherFields } =
      updateUserDto;

    const userProfile = await this.userRepo.findOne({ email: e_mail });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    if (email) {
      const existingUser = await this.userRepo.findOne({ email });
      if (
        existingUser &&
        existingUser._id.toString() !== userProfile._id.toString()
      ) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData = { ...otherFields };

    const updatedUser = await this.userRepo.findOneAndUpdate(
      { email: e_mail, role: 'Individual' },
      { $set: updateData },
    );

    return {
      status: 'Success',
      message: 'User profile updated successfully',
      user: updatedUser,
    };
  }

  async updateUserWithOtp(email: string, otp: string): Promise<void> {
    try {
      const result = await this.userRepo.findOneAndUpdate(
        { email },
        { $set: { otp } },
      );

      if (result.nModified === 0) {
        throw new NotFoundException('User not found or OTP not updated');
      }
    } catch (error) {
      throw new Error('An error occurred while updating OTP for the user');
    }
  }

  private async updateUser(user: UserRepository) {
    return await this.userRepo.create(user);
  }
}
