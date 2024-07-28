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
  InitializeWalletFunding,
  NINTransaction,
  QueryDVA,
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
      const paid = await this.processBillPayment(billPaymentDto, userId);
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
    const paid = await this.processBillPayment(billPaymentDto, userId);
    // Send Bill Payment Advice to Interswitch
    if (paid === true) {
      try {
        const sendPayment = await this.sendPaymentAdvice(
          billPaymentDto,
          userId,
        );
        return sendPayment;
      } catch (error) {
        this.handleAxiosError(error, 'Error funding wallet ');
      }
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
      const { amount, reference } = fundWalletDto;
      const verifyPayment = await this.verifyPayment(reference);
      if (!verifyPayment) {
        return BadRequestException;
      }
      const update = await this.fundWallet(userId, amount);
      if (update) {
        const transactionData = {
          transactionType: transactionType.WalletFunding,
          transactionStatus: transactionStatus.Successful,
        };
        const createTransaction = this.createTransaction(
          reference,
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

  private async processBillPayment(
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

  async initializePaystackWalletFunding(
    initializeWalletFunding: InitializeWalletFunding,
  ) {
    const baseUrl = process.env.PSTK_BASE_URL;
    const secretKey = process.env.PSTK_SECRET_KEY;
    initializeWalletFunding.reference = this.generateTransactionReference();
    const data = initializeWalletFunding;
    console.log('data sent to paystack', data);
    try {
      const response = await axios.post(
        `${baseUrl}/transaction/initialize`,
        data,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Error funding wallet ');
    }
  }

  async queryDVA(queryDva: QueryDVA) {
    const baseUrl = process.env.PSTK_BASE_URL;
    const secretKey = process.env.PSTK_SECRET_KEY;
    const { accountNumber, preferred_bank, date } = queryDva;

    try {
      const response = await axios.get(
        `${baseUrl}/dedicated_account/requery?account_number=${accountNumber}&provider_slug=${preferred_bank}&date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Error funding wallet ');
    }
  }

  //TOD: COMPLETE THIS AND INTEGRATE IN PAYBILLS
  private async sendPaymentAdvice(transactionDetails: any, userId: string) {
    const baseUrl = process.env.ISW_BASE_URL;
    const TerminalId = process.env.ISW_TERMINAL_ID;
    const user = await this.userRepo.findOne({ userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    try {
      const customerEmail = user.email;
      const {
        paymentCode,
        customerId,
        customerMobile,
        amount,
        requestReference,
      } = transactionDetails;
      const data = {
        customerEmail,
        transactionDetails,
      };
      const authResponse = await this.genISWAuthToken();
      const token = authResponse.access_token;
      const response = await axios.post(baseUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          TerminalId,
        },
        data,
      });
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Error sending payment advice');
    }
  }

  private async verifyPayment(reference: string) {
    const baseUrl = process.env.PSTK_BASE_URL;
    const secretKey = process.env.PSTK_SECRET_KEY;
    try {
      const verifyResponse = await axios.get(
        `${baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return verifyResponse.data;
    } catch (error) {
      this.handleAxiosError(error, 'error verifying payment');
    }
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
    reference: string,
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
      transactionReference: reference,
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
    if (balance > chargeAmount) {
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
        throw new Error('An error occurred while funding wallet');
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

  private generateTransactionReference(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'HUBSTK';
    let result = prefix;
    const randomLength = 20 - prefix.length;
    for (let i = 0; i < randomLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }
}
