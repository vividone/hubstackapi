import { Injectable } from '@nestjs/common';
import { SendMailClient } from 'zeptomail';

@Injectable()
export class EmailService {
  private client: any;

  constructor() {
    const url = process.env.ZEPTO_URL;
    const token = process.env.ZEPTO_TOKEN;
    this.client = new SendMailClient({ url, token });
  }

  async sendEmail(
    sender: string,
    mailSubject: string,
    loadedTemplate: string,
    addressee: any,
  ) {
    try {
      const response = await this.client.sendMail({
        from: {
          address: sender,
          name: 'noreply',
        },
        to: [
          {
            email_address: {
              address: addressee.email,
              name: `${addressee.lastName ?? ''} ${addressee.firstName ?? ''}`,
            },
          },
        ],
        subject: mailSubject,
        htmlbody: loadedTemplate,
      });

      console.log('mail sent');
    } catch (error) {
      console.error('Mail error:', error);
    }
  }

  loadTemplate(
    templateString: string,
    loadedValues: Record<string, string>,
  ): string {
    return templateString.replace(/%\w+%/g, (all) => loadedValues[all] || all);
  }
}
