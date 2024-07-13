import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class ResetPasswordService {
  constructor(private readonly emailService: EmailService) {}

  async sendResetPasswordEmail(email: string, resetPasswordUrl: string) {
    const templateString = '<p>Your password reset url is: %URL%</p>';
    const loadedTemplate = this.emailService.loadTemplate(templateString, {
      '%URL%': resetPasswordUrl,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Forgot Password',
      loadedTemplate,
      { email },
    );
  }
}
