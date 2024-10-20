import { Injectable } from '@nestjs/common';
import { EmailService } from '../configs/email.helper';

@Injectable()
export class OtpService {
  constructor(private readonly emailService: EmailService) { }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpEmail(email: string, otp: string) {
    const htmlTemplate = `
      <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-collapse: collapse; border: 1px solid #dddddd;">
        <tr>
          <td style="padding: 20px; background-color: #007bff; color: white;">
            <h1 style="margin: 0; font-size: 24px; text-align: center;">Verification Code</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 20px 0; text-align: center;">
                  Your verification code is:
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 0; text-align: center;">
                  <div style="
                    font-size: 46px; 
                    font-weight: 800; 
                    color: #007bff;
                    letter-spacing: 5px;
                    background-color: #f8f9fa;
                    display: inline-block;
                    padding: 20px 40px;
                    border-radius: 10px;
                    border: 2px solid #e9ecef;
                  ">
                    %OTP%
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 0; text-align: center; color: #555555;">
                  <div style="color: #dc3545;">This code will expire in 5 minutes</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; background-color: #f8f9fa; text-align: center; font-size: 12px; color: #666666;">
            If you didn't request this code, please ignore this email.<br>
            This is an automated message, do not reply.
          </td>
        </tr>
      </table>
    `;

    const plainTextTemplate = `
Your Verification Code

Your code is: %OTP%

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.
This is an automated message, do not reply.`;

    const loadedHtmlTemplate = this.emailService.loadTemplate(htmlTemplate, {
      '%OTP%': otp,
    });

    const loadedTextTemplate = this.emailService.loadTemplate(plainTextTemplate, {
      '%OTP%': otp,
    });

    await this.emailService.sendEmail(
      process.env.NO_REPLY_ADDRESS,
      'Your Verification Code',
      loadedHtmlTemplate,
      {
        email,
        text: loadedTextTemplate
      },
    );
  }
}