/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { WalletFundingDto } from './wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { Types } from 'mongoose';
import { TransactionService } from 'src/transactions/transaction.service';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import { transactionStatus } from 'src/transactions/transaction.dto';
import { BankAccountRepository } from 'src/entity/repositories/bankaccount.repo';
import { NotificationMailingService } from 'src/mailing/notification.mails';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly userService: UsersService,
    private readonly walletRepo: WalletRepository,
    private readonly transactionService: TransactionService,
    private readonly transactionRepo: TransactionRepository,
    private readonly bankRepo: BankAccountRepository,
    private readonly notificationMailingService: NotificationMailingService,
  ) {}

  async fetchBankAccounts(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const convertedUserId = new Types.ObjectId(userId);
    try {
      const bankAccounts = await this.bankRepo.find({ user: convertedUserId });
      return bankAccounts;
    } catch (error) {
      throw new NotFoundException('User does not have any account');
    }
  }

  async createWallet(userId: string) {
    const userWalletExists = await this.getUserWallet(userId);
    if (userWalletExists !== null) {
      return userWalletExists;
    } else {
      const createWallet = await this.walletRepo.create({ user: userId });
      return createWallet;
    }
  }
  // async createVirtualAccount(data: CreateWalletDto, id: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;
  //   try {
  //     const user = await this.userRepo.findOne({ _id: id });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }
  //     // "email": "user@eexample.com",
  //     // "is_permanent": true,
  //     // "bvn": "12345678901",
  //     // "tx_ref": "YOUR_REFERENCE",
  //     // "phonenumber": "0800000000",
  //     // "firstname": "Example",
  //     // "lastname": "User",
  //     // "narration": "Example User"

  //     const email: string = user.email;
  //     const tx_ref: string = this.generateAccountReference();
  //     const country = 'NG';
  //     const is_permanent: boolean = true;
  //     const bvn: string = data.BVN;
  //     const phonenumber: string = data.mobilenumber;
  //     const narration: string = `Hubstack Customer ${data.firstname} ${data.lastname}`;

  //     const { ...rest } = data;
  //     const requestData = {
  //       email,
  //       is_permanent,
  //       bvn,
  //       phonenumber,
  //       tx_ref,
  //       country,
  //       narration,
  //       ...rest,
  //     };

  //     const response = await axios.post(
  //       `${baseUrl}/virtual-account-numbers`,
  //       requestData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     const { account_number, order_ref, flw_ref, bank_name } =
  //       response.data.data;

  //     const createVirtualAccount = {
  //       email: email,
  //       accountName: `${user.firstname} ${user.lastname}`,
  //       accountNumber: account_number,
  //       bankName: bank_name,
  //       orderRef: order_ref,
  //       accountReference: flw_ref,
  //       user: user._id,
  //     };

  //     const savedVirtualAccount =
  //       await this.walletRepo.create(createVirtualAccount);

  //     return {
  //       message: 'Account created successfully',
  //       data: savedVirtualAccount,
  //     };
  //   } catch (error) {
  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while creating subaccount',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while creating subaccount');
  //     }
  //   }
  // }
  //create customer

  // async createCustomerWallet(data: CreateWalletDto, id: string) {
  //   const baseUrl: string = process.env.PSTK_BASE_URL;
  //   const secretKey: string = process.env.PSTK_SECRET_KEY;

  //   try {
  //     const user = await this.userRepo.findOne({ _id: id });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     const email: string = user.email;

  //     const { bvn, ...rest } = data;
  //     const payLoad = {
  //       email,
  //       bvn,
  //       ...rest,
  //     };

  //     // Create customer
  //     const customerResponse = await axios.post(
  //       `${baseUrl}/customer`,
  //       payLoad,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     const {
  //       id: customerId,
  //       customer_code: customerCode,
  //       integration,
  //     } = customerResponse.data.data;

  //     const createdCustomer = {
  //       email: email,
  //       customer_code: customerCode,
  //       customer_id: customerId,
  //       integration: integration,
  //       user: user._id,
  //     };

  //     const savedCustomer = createdCustomer;

  //     // const dvaPayload = {
  //     //   customer: customerId,
  //     //   preferred_bank: 'wema-bank',
  //     // };

  //     // const dvaResponse = await axios.post(
  //     //   `${baseUrl}/dedicated_account`,
  //     //   dvaPayload,
  //     //   {
  //     //     headers: {
  //     //       Authorization: `Bearer ${secretKey}`,
  //     //       'Content-Type': 'application/json',
  //     //     },
  //     //   },
  //     // );

  //     // const dvaData = dvaResponse.data.data;

  //     return {
  //       message: 'Customer and DVA created successfully',
  //       customer: savedCustomer,
  //       //dva: dvaData,
  //     };
  //   } catch (error) {
  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while creating customer and DVA',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while creating customer and DVA');
  //     }
  //   }
  // }

  // Paystack Implementation

  // Get list of Nigerian Banks

  // Validate customer

  async getUserWalletBalance(userId: string) {
    const userIdString = new Types.ObjectId(userId).toString();
    try {
      const user = await this.walletRepo.findOne({ user: userIdString });
      if (!user) {
        throw new NotFoundException('Wallet not found');
      }
      const balance = user.balance;
      return balance;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while fetching the wallet balance');
      }
    }
  }

  async getUserWallet(userId: string) {
    const userIdString = new Types.ObjectId(userId).toString();
    try {
      const wallet = await this.walletRepo.findOne({ user: userIdString });
      return wallet;
    } catch (error) {
      throw error;
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

      if (transaction.status === 'funded') {
        return {
          message: 'Wallet has already been funded for this transaction.',
        };
      }

      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      Logger.log('UUser', user);
      Logger.log('UUserID', userId);

      const wallet = await this.walletRepo.findOne({ user: userId });
      if (!wallet) {
        throw new NotFoundException('Wallet not found.');
      }

      wallet.balance += transaction.amount;
      await wallet.save();

      transaction.status = 'funded';
      await transaction.save();

      const email = user.email;
      const formattedTransactionData = `
        Transaction Reference: ${transaction.transactionReference}\n
        Amount: ${transaction.amount}\n
      `;
      await this.notificationMailingService.sendTransactionSummary(
        email,
        formattedTransactionData,
      );

      return { message: 'Wallet funded successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.error('Unexpected error:', error);
        throw new InternalServerErrorException(
          'An unexpected error occurred. Please try again later.',
        );
      }
    }
  }

  async checkAndVerifyFunding(userId: string) {
    const transactions = await this.transactionRepo.find({
      user: userId,
      transactionStatus: 'funded',
      manualVerify: false,
    });

    if (transactions.length > 0) {
      return await this.handleTransactions(transactions);
    }
    await this.delay(180000);
    return {
      message:
        'No funded transactions found. Verification will be attempted after a delay.',
    };
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handleTransactions(transactions: any) {
    const sortedTransactions = transactions.sort(
      (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const latestTransaction = sortedTransactions[0];

    if (latestTransaction.transactionStatus === 'funded') {
      latestTransaction.manualVerify = true;
      await latestTransaction.save();
      return { message: 'Wallet has already been funded.' };
    }

    return await this.fundWalletProcess(
      latestTransaction.user,
      latestTransaction._id.toString(),
    );
  }

  public generateAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  private async fundWallet(userId: string, walletFundingDto: WalletFundingDto) {
    try {
      const { amount } = walletFundingDto;

      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than zero.');
      }
      const walletBalance = await this.getUserWallet(userId);
      if (!walletBalance) {
        throw new NotFoundException('Wallet not found');
      }
      const { balance, _id } = walletBalance;
      const newBalance = balance + amount;

      const updatedWallet = await this.walletRepo.findOneAndUpdate(
        { _id },
        { balance: newBalance },
      );
      if (!updatedWallet) {
        throw new Error('Failed to update wallet balance.');
      }
      return updatedWallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        throw new Error('An error occurred while funding the wallet.');
      }
    }
  }

  // async getAVirtualAccount(userId: string) {
  //   try {
  //      if (!Types.ObjectId.isValid(userId)) {
  //        throw new BadRequestException('Invalid user ID format');
  //      }
  //      const convertedUserId = new Types.ObjectId(userId);
  //      const account = await this.walletRepo.findOne({ user: convertedUserId });
  //      if (!account) {
  //        throw new NotFoundException('Wallet not found');
  //      }
  //      return account;
  //    } catch (error) {
  //      if (error instanceof BadRequestException || error instanceof NotFoundException) {
  //        throw error;
  //      }
  //      throw new Error('Error retrieving user wallet');
  //    }
  //  }

  // async getSubaccountBalance(accountReference: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;

  //   try {
  //     const response = await axios.get(
  //       `${baseUrl}/payout-subaccounts/${accountReference}/balances`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     return {
  //       message: 'Balance fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  // async getAccountNumber(accountReference: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;

  //   try {
  //     const response = await axios.get(
  //       `${baseUrl}/payout-subaccounts/${accountReference}/static-account`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     return {
  //       message: 'Account fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  // async getAllStaticAccounts() {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;

  //   try {
  //     const response = await axios.get(`${baseUrl}/payout-subaccounts`, {
  //       headers: {
  //         Authorization: `Bearer ${secretKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     return {
  //       message: 'Accounts fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  // async getSubaccountBalance(accountReference: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;
  //   try {
  //     const response = await axios.get(
  //       `${baseUrl}/payout-subaccounts/${accountReference}/balances`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     return {
  //       message: 'Balance fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  // async getSubaccountBalanceOnLogin(userId: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;
  //   try {
  //     const wallet = await this.walletRepo.findOne({ user: userId });

  //     if (!wallet || !wallet.accountReference) {
  //       throw new Error('Wallet or account reference not found for the user');
  //     }

  //     const accountReference = wallet.accountReference;
  //     const response = await axios.get(
  //       `${baseUrl}/payout-subaccounts/${accountReference}/balances`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     return {
  //       message: 'Balance fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  // async getAllStaticAccounts() {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;

  //   try {
  //     const response = await axios.get(`${baseUrl}/payout-subaccounts`, {
  //       headers: {
  //         Authorization: `Bearer ${secretKey}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     return {
  //       message: 'Accounts fetched successfully',
  //       data: response.data.data,
  //     };
  //   } catch (error) {
  //     console.error('Error:', error);

  //     if (error.response) {
  //       console.error('Error response data:', error.response.data);
  //       throw new Error(
  //         error.response.data.message ||
  //           'An error occurred while fetching balance',
  //       );
  //     } else if (error.request) {
  //       console.error('Error request:', error.request);
  //       throw new Error('No response received from the server');
  //     } else {
  //       console.error('Error message:', error.message);
  //       throw new Error('An error occurred while fetching balance');
  //     }
  //   }
  // }

  public generateAccountReference(): string {
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
