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
import { handleAxiosError } from 'src/configs/handleAxiosError';
import { WalletService } from './wallet.service';
import { BankAccountRepository } from 'src/entity/repositories/bankaccount.repo';
import { TransactionService } from 'src/transactions/transaction.service';
import {
  transactionType,
  transactionStatus,
  FundWalletTransaction,
  paymentMode,
} from 'src/transactions/transaction.dto';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class FlutterwaveWalletService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly walletService: WalletService,
    private readonly bankRepo: BankAccountRepository,
    private readonly transactionService: TransactionService,
  ) {}

  private baseUrl: string = process.env.FLW_BASE_URL;
  private secretKey: string = process.env.FLW_SECRET_KEY;

  async createVirtualAccount(data: CreateWalletDto, id: string) {
    try {
      const user = await this.userRepo.findOne({ _id: id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const checkCustomerAccount = await this.getWemaAccount(id);

      if (checkCustomerAccount.status === true) {
        return {
          message: 'Virtual Account already exists ',
          data: checkCustomerAccount.data,
        };
      } else {
        const email: string = user.email;
        const account_reference: string =
          this.walletService.generateAccountReference();
        //const country = 'NG';

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          existingAccountNumber,
          existingBankName,
          mobilenumber,
          ...rest
        } = data;
        const requestData = {
          ...rest,
          phonenumber: mobilenumber,
          is_permanent: true,
          tx_ref: account_reference,
        };
        // console.log('DATA TO FLW', requestData);

        const response = await axios.post(
          `${this.baseUrl}/virtual-account-numbers`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${this.secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        );

        const { account_number, account_name, bank_name } = response.data.data;

        const createdVirtualAccount = {
          accountName: account_name,
          accountNumber: account_number,
          bankName: bank_name,
          accountReference: account_reference,
          user: user._id,
          provider: 'Flutterwave',
        };

        // Logger.log('createdVirtualAccount', createdVirtualAccount);
        const savedVirtualAccount = await this.bankRepo.create(
          createdVirtualAccount,
        );

        return {
          message: 'Virtual Account created successfully',
          data: savedVirtualAccount,
        };
      }
    } catch (error) {
      handleAxiosError(
        error,
        'An error occurred while creating virtual account with flutterwave',
      );
    }
  }

  async getWemaAccount(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const convertedUserId = new Types.ObjectId(userId);
    // console.log('convertedUserId', convertedUserId);
    const provider = 'Flutterwave';
    const wallet = await this.bankRepo.findOne({
      user: convertedUserId,
      provider: provider,
    });

    //Logger.log('Flutterwave Wema', wallet);
    // if (!wallet) {
    //   throw new NotFoundException('Wallet not found');
    // }
    if (wallet === null) {
      return { status: false, data: null };
    } else {
      return { status: true, data: wallet };
    }
  }

  //WEBHOOKS
  async handleSuccessfulCharge(
    customer: string,
    transactionReference: string,
    amount: number,
  ) {
    // Logger.log('Customer Data', customer);
    // Logger.log('transactionReference', transactionReference);
    // Logger.log('amount ', amount);

    try {
      const userDetails = await this.userRepo.findOne({ email: customer });
      // Logger.log('User Details', userDetails);
      const { _id } = userDetails;
      const user = _id.toString();

      console.log('User ID', user);

      // const wallet = await this.walletRepo.findOne({ user: transformedUserid });
      // if (!wallet) {
      //   throw new NotFoundException('Wallet not found.');
      // }

      let transaction = {amount, transactionReference, user, paymentMode: 'account_transfer'}

      await this.createAndProcessTransaction(
        transaction
      );
    } catch (error) {
      Logger.error('Error processing Flutterwave charge:', error);
      throw new InternalServerErrorException(
        'An error occurred while processing the charge.',
      );
    }
  }

  async createAndProcessTransaction(
    fundWalletDto: FundWalletTransaction,
  ) {
    try {
      const transactionData = {
        transactionReference: fundWalletDto.transactionReference,
        amount: fundWalletDto.amount,
        transactionType: transactionType.WalletFunding,
        transactionStatus: transactionStatus.Funded,
        paymentMode: fundWalletDto.paymentMode,
        transactionDetails: fundWalletDto,
        user: fundWalletDto.user,
      };

      const createTransaction =
        await this.transactionService.createTransaction(transactionData);
      const { _id } = createTransaction;
      const transactionId = _id.toString();
      await this.walletService.fundWalletProcess(fundWalletDto.user, transactionId);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new InternalServerErrorException('Failed to create transaction.');
    }
  }

  // async fundWalletProcess(userId: string, transactionId: string) {
  //   try {
  //     const transaction = await this.transactionRepo.findOne({ _id: transactionId });

  //     if (!transaction) {
  //       throw new NotFoundException('Transaction not found.');
  //     }
  //     if (transaction.status === 'funded') {
  //       return { message: 'Wallet has already been funded for this transaction.' };
  //     }

  //     const wallet = await this.walletRepo.findOne({ userId });

  //     if (!wallet) {
  //       throw new NotFoundException('Wallet not found.');
  //     }

  //     wallet.balance += transaction.amount;
  //     await wallet.save();
  //     transaction.status = 'funded';
  //     await transaction.save();

  //     // const email = user.email;
  //     // const formattedTransactionData = `
  //     //   Transaction Reference: ${transaction.transactionReference}\n
  //     //   Amount: ${transaction.amount}\n
  //     // `;
  //     // await this.notificationMailingService.sendTransactionSummary(email, formattedTransactionData);

  //     return { message: 'Wallet funded successfully.' };
  //   } catch (error) {
  //     console.error('Error funding wallet:', error);
  //     throw new InternalServerErrorException('Failed to fund wallet.');
  //   }
  // }
}
