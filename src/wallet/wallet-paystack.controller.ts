import {
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
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
      console.log('Signature missing');
      throw new HttpException('Signature missing', HttpStatus.BAD_REQUEST);
    }

    const bodyString = JSON.stringify(req.body);

    const hash = crypto
      .createHmac('sha512', secret)
      .update(bodyString)
      .digest('hex');
    console.log(hash);
    if (signature !== hash) {
      console.log('Invalid signature');
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      console.log('Invalid request body');
      throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
    }

    const { event, data } = body;
    console.log('body of what should be the recent webhook body: ', body);

    if (event === 'charge.success' && data.status === 'success') {
      const customer = data.customer;
      const transactionReference = data.reference;
      const amount = data.amount / 100;

      try {
        await this.paystackWalletService.handleSuccessfulCharge(
          customer,
          transactionReference,
          amount,
        );
      } catch (error) {
        console.error('Failed to handle successful charge:', error);
      }
    }

    return res.status(200).send('Webhook received');
  }
}
