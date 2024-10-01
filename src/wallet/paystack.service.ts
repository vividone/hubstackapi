/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { Types } from 'mongoose';
import { TransactionService } from 'src/transactions/transaction.service';
import {
  InitializeWalletFunding,
  transactionStatus,
  transactionType,
} from 'src/transactions/transaction.dto';
import { handleAxiosError } from 'src/configs/handleAxiosError';
import { WalletService } from './wallet.service';
import { BankAccountRepository } from 'src/entity/repositories/bankaccount.repo';
import { isEmpty, isNotEmpty, isNotEmptyObject } from 'class-validator';
import { UsersService } from 'src/users/users.service';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';

@Injectable()
export class PaystackWalletService {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly userService: UsersService,
    private readonly transactionRepo: TransactionRepository,
    private readonly transactionService: TransactionService,
    private readonly bankRepo: BankAccountRepository,
  ) {}

  private baseUrl = process.env.PSTK_BASE_URL;
  private secretKey = process.env.PSTK_SECRET_KEY;
  private ENV = process.env.ENV;

  async getBanks() {
    try {
      const response = await axios.get(`${this.baseUrl}/bank`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const banks = { data: response.data.data, message: 'Successfull' };

      return banks;
    } catch (error) {
      handleAxiosError(
        error,
        'An error occurred while retrieving the bank code',
      );
    }
  }

  // Get code for the bank name

  private async getBankCode(bankName: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/bank`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const bank = response.data.data.find((bank) => bank.name === bankName);
      if (!bank) {
        throw new NotFoundException('Bank not found');
      }

      return bank.code;
    } catch (error) {
      handleAxiosError(
        error,
        'An error occurred while retrieving the bank code',
      );
    }
  }

  async initializePaystackWalletFunding(
    initializeWalletFunding: InitializeWalletFunding,
    userId: string,
  ) {
    const reference = this.transactionService.generateTransactionReference();
    const data = {
      email: initializeWalletFunding.email,
      amount: initializeWalletFunding.amount,
      reference: reference,
    };
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { reference } = response.data.data;
      const { status } = response.data;

      if (status === true) {
        const transactionData = {
          transactionReference: reference,
          amount: initializeWalletFunding.amount,
          transactionType: transactionType.WalletFunding,
          transactionStatus: transactionStatus.Pending,
          paymentMode: initializeWalletFunding.paymentMode,
          transactionDetails: initializeWalletFunding,
          user: userId,
        };

        const startTransaction =
          await this.transactionService.createTransaction(transactionData);
        return startTransaction;
      }
    } catch (error) {
      handleAxiosError(error, 'Error with trnsaction creation ');
    }
  }

  async createPaystackBankAccount(data: CreateWalletDto, id: string) {
    const { bvn, existingAccountNumber, existingBankName } = data;
    Logger.log('Find User ', id);
  
    const user = await this.userService.findUserById(id);
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const email: string = user.email;
    const first_name: string = user.firstname;
    const last_name: string = user.lastname;
    const phone: string = user.phone_number;
    let fetchPaystackCustomer: any;
    try {
      fetchPaystackCustomer = await this.fetchPaystackCustomer(email);
      console.log('Paystack fetchPaystackCustomer', fetchPaystackCustomer);
    } catch (error) {
      if (error.response && error.response.statusCode === 404) {
        console.log('Customer not found on Paystack, creating a new customer...');
      } else {
        //console.error('An error occurred while fetching the customer from Paystack', error);
        throw new BadRequestException('An error occurred while fetching the customer');
      }
    }
  
    if (!fetchPaystackCustomer || isEmpty(fetchPaystackCustomer)) {
      const customer = await this.createCustomer(
        user._id,
        email,
        first_name,
        last_name,
        phone,
      );
      const customer_code = customer.customer_code;
      const paystackBankAccount = await this.createDVAccount(customer_code);
      const { account_number, account_name, bank_name, slug } = paystackBankAccount.data;
  
      const createdVirtualAccount = {
        accountName: account_name,
        accountNumber: account_number,
        bankName: bank_name,
        bank_slug: slug,
        user: user._id,
        provider: 'Paystack',
      };
  
      const savedVirtualAccount = await this.bankRepo.create(createdVirtualAccount);
      return {
        message: 'Virtual Account created successfully',
        data: savedVirtualAccount,
      };
    } else {
      const { customer_code, id } = fetchPaystackCustomer;
      const paystackBankAccount = await this.createDVAccount(id);
  
      const { account_number, account_name, bank_name, slug } = paystackBankAccount.data;
  
      const createdVirtualAccount = {
        accountName: account_name,
        accountNumber: account_number,
        bankName: bank_name,
        bank_slug: slug,
        user: user._id,
        provider: 'Paystack',
      };
      const savedVirtualAccount = await this.bankRepo.create(createdVirtualAccount);
      return {
        message: 'Paystack Virtual Account created successfully',
        data: savedVirtualAccount,
      };
    }
  }
  
  

  async handleSuccessfulCharge(
    customer: any,
    transactionReference: string,
    amount: number,
  ) {
    const { email } = customer;

    try {
      const wallet = await this.walletRepo.findOne({ email });
      if (!wallet) {
        throw new NotFoundException('Wallet not found.');
      }

      await this.createAndProcessTransaction(
        wallet.userId,
        transactionReference,
        amount,
      );
    } catch (error) {
      console.error('Error processing Flutterwave charge:', error);
      throw new InternalServerErrorException(
        'An error occurred while processing the charge.',
      );
    }
  }

  async createAndProcessTransaction(
    userId: string,
    transactionReference: string,
    amount: number,
  ) {
    try {
      const transactionData = {
        transactionReference: transactionReference,
        amount: amount,
        transactionType: transactionType.WalletFunding,
        transactionStatus: transactionStatus.Pending,
        paymentMode: 'account_transfer',
        transactionDetails: 'wallet-funding',
        user: userId,
      };

      const createTransaction =
        await this.transactionService.createTransaction(transactionData);
      const { _id } = createTransaction;
      const transactionId = _id.toString();
      await this.fundWalletProcess(userId, transactionId);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction.');
    }
  }

  async fundWalletProcess(userId: string, transactionId: string) {
    try {
      const transaction = await this.transactionRepo.findOne({
        _id: transactionId,
      });
      if (!transaction) {
        throw new NotFoundException('Transaction not found.');
      }

      const wallet = await this.walletRepo.findOne({ userId });
      if (!wallet) {
        throw new NotFoundException('Wallet not found.');
      }

      wallet.balance += transaction.amount;
      await wallet.save();

      transaction.status = transactionStatus.Successful;
      await transaction.save();
    } catch (error) {
      console.error('Error funding wallet:', error);
      throw new InternalServerErrorException('Failed to fund wallet.');
    }
  }
  private async createCustomer(
    userId: string,
    email: string,
    first_name: string,
    last_name: string,
    phone: string,
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customer`,
        { email, first_name, last_name, phone },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const { id, customer_code, integration } = response.data.data;
      return {
        email,
        customer_code,
        customer_id: id,
        integration,
        user: userId,
      };
    } catch (error) {
      handleAxiosError(error, 'An error occurred while creating the customer');
    }
  }

  private async fetchPaystackCustomer(email: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/customer/${email}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.data;
    } catch (error) {
      handleAxiosError(error, 'An error occurred while fetching the customer');
    }
  }

  private async validateCustomer(validatePayload: any, customer_code: string) {
     const { account_number, bank_code } = validatePayload;

    const payload = validatePayload;
    try {
      const response = await axios.post(
        `${this.baseUrl}/customer/${customer_code}/identification`,
        { payload },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const resolves = response.data.data;
      if (!resolves) {
        throw new NotFoundException('Not found');
      }
      // console.log(response);

      return resolves;
    } catch (error) {
      handleAxiosError(
        error,
        'An error occurred while validating user identity',
      );
    }
  }

  private async createDVAccount(customerId: string) {
    const dvaPayload = {
      customer: customerId,
      preferred_bank:
        this.ENV === 'development' ? 'test-bank' : 'titan-paystack',
    };

    const dvaResponse = await axios.post(
      `${this.baseUrl}/dedicated_account`,
      dvaPayload,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return dvaResponse.data;
  }
}
