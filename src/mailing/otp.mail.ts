import { Injectable } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';

@Injectable()
export class OtpService {
  constructor(private readonly emailService: EmailService) {}

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpEmail(
    email: string,
    otp: string
  ) {
    const templateString = '<p>Your OTP is: %OTP%</p>';
    const loadedTemplate = this.emailService.loadTemplate(templateString, {
      '%OTP%': otp,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Your OTP Code',
      loadedTemplate,
      { email },
    );
  }
}
