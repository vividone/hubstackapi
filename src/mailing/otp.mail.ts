import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class OtpService {
  constructor(
    private readonly emailService: EmailService,
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
}
