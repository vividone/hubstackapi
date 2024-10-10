import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaystackWalletService } from './paystack.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('hooks/pstk')
export class PaystackWebhookController {
  constructor(private readonly paystackWalletService: PaystackWalletService) {}

  @Post('event')
  async handlePaystackWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('Received Paystack webhook request');
    const secret = process.env.PSTK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string;

    console.log(signature);

    if (!signature) {
      throw new HttpException('Signature missing', HttpStatus.BAD_REQUEST);
    }
    console.log('WH Request Body', req.body);
    Logger.log('WH Event', req.body.event);
    Logger.log('WH Data', req.body.data);

    let body: { event: any; data: any };
    try {
      body = req.body;
    } catch (error) {
      throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
    }
    const { event, data } = body;
    if (event === 'charge.success' && data.status === 'success') {
      const customer = data.customer.email;
      const transactionReference = data.reference;
      const amount = data.amount;

      const convertedAmount = this.convertToNaira(amount);

      try {
        await this.paystackWalletService.handleSuccessfulCharge(
          customer,
          transactionReference,
          convertedAmount,
        );

        res
          .status(HttpStatus.OK)
          .json({ message: 'Wallet funded successfully.' });
      } catch (error) {
        console.error('Failed to fund wallet:', error);
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Failed to fund wallet.' });
      }
    }
  }

  private convertToNaira(amount: number) {
    const converted = amount / 100;
    return converted;
  }
}
