import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
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
      throw new NotFoundException('User not found');
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
}
