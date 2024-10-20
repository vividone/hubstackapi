import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class NotificationMailingService {
  constructor(private readonly emailService: EmailService) {}

  async sendTransactionSummary(email: string, transactionSummary: any) {
    const formattedData = `
      <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; border: 1px solid #dddddd;">
        <tr>
          <td style="padding: 20px; background-color: #007bff; color: white;">
            <h1 style="margin: 0; font-size: 24px; text-align: center;">Transaction Summary</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
                  <table style="width: 100%;">
                    <tr>
                      <td style="color: #555555; width: 40%;"><strong>Transaction Reference:</strong></td>
                      <td style="color: #333333;">${transactionSummary.transactionReference}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eeeeee;">
                  <table style="width: 100%;">
                    <tr>
                      <td style="color: #555555; width: 40%;"><strong>Amount:</strong></td>
                      <td style="color: #333333;">₦${transactionSummary.amount}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px;">
                  <table style="width: 100%;">
                    <tr>
                      <td style="color: #555555; width: 40%;"><strong>Type:</strong></td>
                      <td style="color: #333333;">${transactionSummary.transactionType}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #f8f9fa; text-align: center; font-size: 12px; color: #666666;">
            This is an automated message. Please do not reply to this email.
          </td>
        </tr>
      </table>
    `;

    const templateString = '<p>%Data%</p>';
    
    // Now use the formatted data with your template
    const loadedTemplate = this.emailService.loadTemplate(templateString, {
      '%Data%': formattedData,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Transaction Successful',
      loadedTemplate,
      {email},
    );
  }
}