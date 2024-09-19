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
import { FlutterwaveWalletService } from './flutterwave.service';
import { ApiTags } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';

@ApiTags('Webhooks')
@Controller('hooks/flw')
export class FlutterwaveWebhookController {
  constructor(
    private readonly flutterwaveWalletService: FlutterwaveWalletService,
  ) { }
  private secret = process.env.FLW_SECRET_KEY;

  @Post('event')
  async handleFlutterwaveWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('Received Flutterwave webhook request');
    const signature = req.headers['verif-hash'] as string;
  
    if (!signature) {
      throw new HttpException('Signature missing', HttpStatus.BAD_REQUEST);
    }
  
    const bodyString = JSON.stringify(req.body);
    const hash = crypto.createHmac('sha512', this.secret).update(bodyString).digest('hex');
  
    if (signature !== hash) {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }
  
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (error) {
      throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
    }
  
    const { event, data } = body;
  
    if (event === 'charge.completed' && data.status === 'successful') {
      const customer = data.customer.email;
      const transactionReference = data.tx_ref;
      const amount = data.amount; 
  
      try {
        await this.flutterwaveWalletService.handleSuccessfulCharge(customer, transactionReference, amount);
  
        res.status(HttpStatus.OK).json({ message: 'Wallet funded successfully.' });
      } catch (error) {
        console.error('Failed to fund wallet:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fund wallet.' });
      }
    }
  }
  
}
