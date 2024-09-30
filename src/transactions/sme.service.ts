import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { paymentMode, PurchasePhoneBillsDto, transactionStatus, transactionType } from './transaction.dto';
import { TransactionService } from './transaction.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SmeService {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UsersService,
  ) {}

  async purchaseAirtime(purchaseAirtimeDto: PurchasePhoneBillsDto, userId: string) {
    const baseUrl: string = process.env.SME_BASE_URL;
    const privateKey: string = process.env.SME_PRIVATE_KEY;
  
    try {
      const url = `${baseUrl}/airtime/purchase`;
      const { network_id, phone, amount, paymentMode } = purchaseAirtimeDto;
      if (!network_id || !phone || !amount) {
        throw new BadRequestException('Required payment details are missing');
      }
  
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const data = { network_id, phone, amount };
      const reference = this.transactionService.generateRequestReference();
  
      const walletBalance = await this.transactionService.getUserWallet(userId);
      if (!walletBalance || walletBalance.balance < amount) {
        throw new BadRequestException('Insufficient Wallet Balance');
      }
      const transactionData = {
        transactionReference: reference,
        amount,
        transactionType: transactionType.BuyAirtime,
        transactionStatus: transactionStatus.Pending,
        paymentMode,
        transactionDetails: purchaseAirtimeDto,
        user: userId,
      };
  
      const createTransaction = await this.transactionService.createTransaction(transactionData);
      if (!createTransaction || !createTransaction._id) {
        console.error('Transaction creation failed:', createTransaction);
        throw new BadRequestException('Transaction creation failed');
      }
  
      const transactionId = createTransaction._id.toString();
      try {
        const response = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.data.status === 'true') {
          const updatedTransaction = await this.transactionService.handleMobileBillPayment(
            createTransaction.transactionDetails,
            userId,
            transactionId,
          );
          return {
            airtimeResponse: response.data,  
            updatedTransaction,              
          };
        } else {
          throw new Error('Airtime purchase failed');
        }
      } catch (axiosError) {
        this.handleAxiosError(axiosError, 'Error during airtime purchase');
      }
    } catch (error) {
      console.error('Error in airtime purchase function:', error);
      throw new InternalServerErrorException('Error processing airtime purchase');
    }
  }
  
  async purchaseData(purchaseDataDto: PurchasePhoneBillsDto, userId: string) {
    const baseUrl: string = process.env.SME_BASE_URL;
    const privateKey: string = process.env.SME_PRIVATE_KEY;
  
    try {
      const url = `${baseUrl}/data/purchase`;
      const { network_id, plan_id, phone, amount, paymentMode } = purchaseDataDto;
      if (!network_id || !phone || !plan_id) {
        throw new BadRequestException('Required payment details are missing');
      }
  
      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const data = { network_id, plan_id, phone };
      const reference = this.transactionService.generateRequestReference();
  
      const walletBalance = await this.transactionService.getUserWallet(userId);
      if (!walletBalance || walletBalance.balance < amount) {
        throw new BadRequestException('Insufficient Wallet Balance');
      }
      const transactionData = {
        transactionReference: reference,
        amount,
        transactionType: transactionType.BuyAirtime,
        transactionStatus: transactionStatus.Pending,
        paymentMode,
        transactionDetails: purchaseDataDto,
        user: userId,
      };
  
      const createTransaction = await this.transactionService.createTransaction(transactionData);
      if (!createTransaction || !createTransaction._id) {
        console.error('Transaction creation failed:', createTransaction);
        throw new BadRequestException('Transaction creation failed');
      }
  
      const transactionId = createTransaction._id.toString();
      try {
        const response = await axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${privateKey}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (response.data.status === 'true') {
          const updatedTransaction = await this.transactionService.handleMobileBillPayment(
            createTransaction.transactionDetails,
            userId,
            transactionId,
          );
          return {
            dataResponse: response.data,  
            updatedTransaction,              
          };
        } else {
          throw new Error('Data purchase failed');
        }
      } catch (axiosError) {
        this.handleAxiosError(axiosError, 'Error during Data purchase');
      }
    } catch (error) {
      console.error('Error in Data purchase function:', error);
      throw new InternalServerErrorException('Error processing data purchase');
    }
  }



  private handleAxiosError(error: any, customMessage: string) {
    if (error.response) {
      console.error(
        `${customMessage} - Response Status: ${error.response.status}`,
      );
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error(`${customMessage} - No response received:`, error.request);
    } else {
      console.error(
        `${customMessage} - Error setting up request:`,
        error.message,
      );
    }
    throw new Error(customMessage);
  }
}

