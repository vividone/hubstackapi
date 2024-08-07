/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { Types } from 'mongoose';
import { handleAxiosError } from 'src/configs/handleAxiosError';
import { WalletService } from './wallet.service';
import { BankAccountRepository } from 'src/entity/repositories/bankaccount.repo';
import { TransactionService } from 'src/transactions/transaction.service';

@Injectable()
export class FlutterwaveWalletService {
  constructor(
    private readonly walletRepo: WalletRepository,
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
          data: checkCustomerAccount,
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

  private async getWemaAccount(id: string) {
    try {
      const account = await this.bankRepo.findOne({
        user: id,
        provider: 'Flutterwave',
      });
      if (account) {
        return { status: true, data: account };
      } else {
        return { status: false, data: null };
      }
    } catch (error) {
      handleAxiosError(
        error,
        'An error occurred fetching virtual account with flutterwave',
      );
    }
  }
}
