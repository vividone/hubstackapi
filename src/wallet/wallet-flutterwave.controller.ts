import { Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { FlutterwaveWalletService } from './wallet-flutterwave.service';
@Controller('webhooks/paystack')
export class PaystackWebhookController {
    constructor(private readonly flutterwaveWalletService: FlutterwaveWalletService) { }

    @Post('event')
    async handleFlutterwaveWebhook(@Req() req: Request, @Res() res: Response) {
        console.log('Received Flutterwave webhook request');
        const secret = process.env.FLW_SECRET_KEY;
        const signature = req.headers['verif-hash'] as string;

        if (!signature) {
            console.log('Signature missing');
            throw new HttpException('Signature missing', HttpStatus.BAD_REQUEST);
        }

        const bodyString = JSON.stringify(req.body);

        const hash = crypto
            .createHmac('sha512', secret)
            .update(bodyString)
            .digest('hex');

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

        if (event === 'charge.completed' && data.status === 'successful') {
            const customer = data.customer;
            const transactionReference = data.tx_ref;
            const amount = data.amount;

            try {
                await this.flutterwaveWalletService.handleSuccessfulCharge(customer, transactionReference, amount);
            } catch (error) {
                console.error('Failed to handle successful charge:', error);
            }
        }
        
        return res.status(200).send('Webhook received');
    }
}