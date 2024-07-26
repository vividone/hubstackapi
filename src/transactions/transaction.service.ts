import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import {
  BillPaymentTransaction,
  BuyUnitTransaction,
  FundWalletTransaction,
  NINTransaction,
  transactionStatus,
  transactionType,
} from './transaction.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { Types } from 'mongoose';

@Injectable()
export class TransactionService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly walletRepo: WalletRepository,
  ) {}

  async getAllTransactions() {
    const transactions = await this.transactionRepo.find();
    return transactions;
  }

  async getTransactions(userId: string, transactionType?: string) {
    const transactions = await this.transactionRepo.find({
      user: userId,
      transactionType: transactionType,
    });
    return transactions;
  }

  async payBills(billPaymentDto: BillPaymentTransaction, userId: string) {
    const { paymentCode, customerCode } = billPaymentDto;
    //Validate Customer
    const validateCustomer = await this.validateCustomer(
      paymentCode,
      customerCode,
    );

    if (!validateCustomer) {
      return 'Customer data is invalid';
    } else {
      const paid = await this.processPayment(billPaymentDto, userId);
      if (paid === true) {
        // Send Bill Payment advice to Interswitch
        return 'Transaction sucessfull';
      } else {
        return 'Transaction not sucessfull';
      }
    }
  }

  async airtimeRecharge(
    billPaymentDto: BillPaymentTransaction,
    userId: string,
  ) {
    const paid = await this.processPayment(billPaymentDto, userId);
    // Send Bill Payment Advice to Interswitch
    if (paid === true) {
      return 'Transaction sucessfull';
    } else {
      return 'Transaction not sucessfull';
    }
  }

  async ninSearch(ninTransaction: NINTransaction, userId: string) {
    console.log(ninTransaction, userId);
    return 'NIN in development';
  }

  async buyUnits(buyUnitsDto: BuyUnitTransaction, userId: string) {
    console.log(buyUnitsDto, userId);
    return 'Unit Buying in development';
  }

  async fundWalletProcess(
    fundWalletDto: FundWalletTransaction,
    userId: string,
  ) {
    try {
      const { amount } = fundWalletDto;
      const update = await this.fundWallet(userId, amount);
      if (update) {
        const transactionData = {
          transactionType: transactionType.WalletFunding,
          transactionStatus: transactionStatus.Successful,
        };
        const createTransaction = this.createTransaction(
          amount,
          fundWalletDto,
          transactionData,
          userId,
        );
        return createTransaction;
      }
    } catch (error) {
      this.handleAxiosError(error, 'Error creating transaction!');
    }
  }

  private async processPayment(
    billPaymentDto: BillPaymentTransaction,
    userId: string,
  ) {
    const { amount } = billPaymentDto;
    let paid: boolean = false;
    // Debit Wallet
    if (billPaymentDto.paymentMode === 'wallet') {
      const payment = await this.debitWallet(userId, amount);
      paid = payment;
    }
    // Send Bill Payment Advice to Interswitch
    return paid;
  }
  private handleAxiosError(error: any, defaultMessage: string) {
    if (error.response) {
      console.error('HTTP Error:', defaultMessage);
      throw new BadRequestException(defaultMessage);
    } else if (error.request) {
      console.error('No response received from the server');
      throw new InternalServerErrorException(
        'No response received from the server',
      );
    } else {
      console.error('Error message:', 'An unexpected error occurred');
      throw new InternalServerErrorException(defaultMessage);
    }
  }

  private async createTransaction(
    amount: number,
    transactionDetails:
      | BillPaymentTransaction
      | BuyUnitTransaction
      | NINTransaction
      | FundWalletTransaction,
    transactionData: any,
    user: string,
  ) {
    const createTransactionData = {
      amount,
      transactionType: transactionData.transactionType,
      transactionStatus: transactionData.transactionStatus,
      transactionDetail: transactionDetails,
      user,
    };

    try {
      const createTransaction = await this.transactionRepo.create(
        createTransactionData,
      );

      return createTransaction;
    } catch (error) {
      this.handleAxiosError(error, 'Error creating transaction!');
    }
  }
  private async genISWAuthToken() {
    const baseUrl: string = process.env.ISW_PASSAUTH_URL;
    const secKey: string = process.env.ISW_SECRET_KEY;
    const clientId: string = process.env.ISW_CLIENT_ID;
    const data = 'grant_type=client_credentials&scope=profile';

    try {
      const response = await axios.post(`${baseUrl}`, data, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      this.handleAxiosError(error, 'An error occurred authenticating!');
    }
  }

  private async validateCustomer(paymentCode: string, customerId: string) {
    const TerminalId = process.env.ISW_TERMINAL_ID;
    const baseUrl: string = process.env.ISW_BASE_URL;

    const validatePayload = {
      customers: [
        {
          PaymentCode: paymentCode,
          CustomerId: customerId,
        },
      ],
      TerminalId: TerminalId,
    };

    let token: string;
    const url = `${baseUrl}/Transactions/validatecustomers`;

    try {
      const authResponse = await this.genISWAuthToken();
      token = authResponse.access_token;
    } catch (error) {
      console.error('Error fetching auth token:', error.message);
      throw new Error('Failed to authenticate');
    }

    try {
      const response = await axios.post(url, validatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          TerminalId,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving billers',
      );
    }
  }

  private async debitWallet(userId: string, chargeAmount: number) {
    const walletBalance = await this.getUserWallet(userId);
    const { balance, _id } = walletBalance;
    if (walletBalance > chargeAmount) {
      const newBalance = balance - chargeAmount;
      // update wallet balance
      await this.walletRepo.findOneAndUpdate(
        { _id: _id },
        { balance: newBalance },
      );
      return true;
    } else {
      return false;
    }
  }

  private async fundWallet(userId: string, amount: number) {
    try {
      const walletBalance = await this.getUserWallet(userId);

      const { balance, _id } = walletBalance;
      const newBalance = balance + amount;
      // update wallet balance
      const response = await this.walletRepo.findOneAndUpdate(
        { _id: _id },
        { balance: newBalance },
      );
      if (response) {
        // create transaction
      }

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while fetching the wallet');
      }
    }
  }

  private async getUserWallet(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const convertedUserId = new Types.ObjectId(userId);
    console.log('convertedUserId', convertedUserId);
    try {
      const wallet = await this.walletRepo.findOne({
        user: convertedUserId,
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }
      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while fetching the wallet');
      }
    }
  }
}
