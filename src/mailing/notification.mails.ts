import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class NotificationMailingService {
  constructor(private readonly emailService: EmailService) {}

  async sendTransactionSummary(email: string, transactionSummary: any) {
    const templateString = '<p>Transaction Summary <br>%Data%</p>';
    const loadedTemplate = this.emailService.loadTemplate(templateString, {
      '%Data%': transactionSummary,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Transaction Successful',
      loadedTemplate,
      { email },
    );
  }
}
