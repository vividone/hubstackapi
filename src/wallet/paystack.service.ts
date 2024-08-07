/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class PaystackWalletService {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly userService: UsersService,
    private readonly walletService: WalletService,
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
    // console.log('data sent to paystack', initializeWalletFunding);
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
    const phone: string = user.mobilenumber;

    const fetchPaystackCustomer = await this.fetchPaystackCustomer(email);
    Logger.log('Paystack fetchPaystackCustomer', fetchPaystackCustomer);

    const bankCode = await this.getBankCode(existingBankName);
    // console.log('Bank Code', bankCode);
    // Validate customer
    const validateCustomerPayload = {
      country: 'NG',
      bvn: bvn,
      bank_code: bankCode,
      account_number: existingAccountNumber,
      type: 'bank_account',
      first_name,
      last_name,
    };
    Logger.log('Paystack validateCustomerPayload', validateCustomerPayload);

    const testValidateCustomerPayload = {
      country: 'NG',
      bvn: '222222222221',
      bank_code: bankCode,
      type: 'bank_account',
      account_number: '0111111111',
      first_name: 'Uchenna',
      last_name: 'Okoro',
    };

    Logger.log(
      'Paystack testValidateCustomerPayload',
      testValidateCustomerPayload,
    );

    if (fetchPaystackCustomer && isEmpty(fetchPaystackCustomer)) {
      const customer = await this.createCustomer(
        user._id,
        email,
        first_name,
        last_name,
        phone,
      );
      Logger.log('Paystack Customer', customer);
      // const validateCustomer = await this.validateCustomer(
      //   validateCustomerPayload,
      //   customer.customer_code,
      // );
      const paystackBankAccount = await this.createDVAccount(
        customer.customer_id,
      );

      const { account_number, account_name, bank_name, slug } =
        paystackBankAccount.data.data;

      const createdVirtualAccount = {
        accountName: account_name,
        accountNumber: account_number,
        bankName: bank_name,
        bank_slug: slug,
        user: user._id,
        provider: 'Paystack',
      };

      // Logger.log('createdVirtualAccount', createdVirtualAccount);
      const savedVirtualAccount = await this.bankRepo.create(
        createdVirtualAccount,
      );
      return {
        message: 'Virtual Account created successfully',
        data: savedVirtualAccount,
      };
    } else {
      const bankCode = await this.getBankCode(existingBankName);
      // console.log('Bank Code', bankCode);
      // Validate customer
      const validateCustomerPayload = {
        country: 'NG',
        bvn: bvn,
        bank_code: bankCode,
        account_number: existingAccountNumber,
        type: 'bank_account',
        first_name,
        last_name,
      };
      // Logger.log('Paystack validateCustomerPayload', validateCustomerPayload);

      const { customer_code, id } = fetchPaystackCustomer;
      // const validateCustomer = await this.validateCustomer(
      //   validateCustomerPayload,
      //   customer_code,
      // );
      // Logger.log('Paystack Customer Validation', validateCustomer);
      const paystackBankAccount = await this.createDVAccount(id);

      const { account_number, account_name, bank_name, slug } =
        paystackBankAccount.data.data;

      const createdVirtualAccount = {
        accountName: account_name,
        accountNumber: account_number,
        bankName: bank_name,
        bank_slug: slug,
        user: user._id,
        provider: 'Paystack',
      };

      Logger.log('Paystack createdVirtualAccount', createdVirtualAccount);
      const savedVirtualAccount = await this.bankRepo.create(
        createdVirtualAccount,
      );
      return {
        message: 'Paystack DVirtual Account created successfully',
        data: savedVirtualAccount,
      };
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

      // Logger.log('Paystack fetchPaystackCustomer', response.data.data);

      return response.data.data;
    } catch (error) {
      handleAxiosError(error, 'An error occurred while fetching the customer');
    }
  }

  private async validateCustomer(validatePayload: any, customer_code: string) {
    // const { account_number, bank_code } = validatePayload;
    const testPayload = {
      country: 'NG',
      type: 'bank_account',
      account_number: '0111111111',
      bvn: '222222222221',
      bank_code: '007',
      first_name: 'Uchenna',
      last_name: 'Okoro',
    };

    const payload = this.ENV === 'development' ? testPayload : validatePayload;
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
