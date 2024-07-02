import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../helpers/email.helper';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class OtpService {
  constructor(
    private readonly emailService: EmailService,
    private readonly userRepo: UserRepository,
  ) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpEmail(
    email: string,
    otp: string,
    firstname: string,
    lastName: string,
  ) {
    const templateString = '<p>Your OTP is: %OTP%</p>';
    const loadedTemplate = this.emailService.loadTemplate(templateString, {
      '%OTP%': otp,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Your OTP Code',
      loadedTemplate,
      { email, firstname, lastName },
    );
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

  async verifyOtp( otp: string) {
    const user = await this.userRepo.findOne({ otp });
    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = null;
    return await user.save();
  }
}
