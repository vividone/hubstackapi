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
import { FlutterwaveWalletService } from './flutterwave.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Webhooks')
@Controller('hooks/flw')
export class FlutterwaveWebhookController {
  constructor(
    private readonly flutterwaveWalletService: FlutterwaveWalletService,
  ) {}
  private secret = process.env.FLW_SECRET_KEY;

  @Post('event')
  async handleFlutterwaveWebhook(@Req() req: Request, @Res() res: Response) {
    Logger.log('Received Flutterwave webhook request');
    const signature = req.headers['verif-hash'] as string;
    Logger.log('Signature', req.headers['verif-hash']);
    Logger.log('Signature', signature);

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
    if (event === 'charge.completed' && data.status === 'successful') {
      const customer = data.customer.email;
      const transactionReference = data.tx_ref;
      const amount = data.amount;

      try {
        await this.flutterwaveWalletService.handleSuccessfulCharge(
          customer,
          transactionReference,
          amount,
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
}
