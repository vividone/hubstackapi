import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { Types } from 'mongoose';
import { handleAxiosError } from 'src/configs/handleAxiosError';
import { WalletService } from './wallet.service';
import { FundWalletTransaction, TransactionDto, transactionStatus, transactionType } from 'src/transactions/transaction.dto';
import { TransactionService } from 'src/transactions/transaction.service';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';

@Injectable()
export class FlutterwaveWalletService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly userRepo: UserRepository,
        private readonly transactionService: TransactionService,
        private readonly transactionRepo: TransactionRepository,
        private readonly walletService: WalletService,
    ) { }

    async createVirtualAccount(data: CreateWalletDto, id: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
        try {
            const user = await this.userRepo.findOne({ _id: id });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const email: string = user.email;
            const account_reference: string = this.walletService.generateAccountReference();
            //const country = 'NG';

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { existingAccountNumber, existingBankName, mobilenumber, ...rest } =
                data;
            const requestData = {
                ...rest,
                phonenumber: mobilenumber,
                is_permanent: true,
                tx_ref: account_reference,
            };
            // console.log('DATA TO FLW', requestData);

            const response = await axios.post(
                `${baseUrl}/virtual-account-numbers`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { account_number, account_name, bank_name } = response.data.data;
            console.log(response.data.data)

            const createdVirtualAccount = {
                email: email,
                accountName: account_name,
                accountNumber: account_number,
                bankName: bank_name,
                accountReference: account_reference,
                user: user._id,
            };

            const savedVirtualAccount = await this.walletRepo.create(
                createdVirtualAccount,
            );

            return {
                message: 'Virtual Account created successfully',
                data: savedVirtualAccount,
            };
        } catch (error) {
            handleAxiosError(
                error,
                'An error occurred while creating virtual account with flutterwave',
            );
        }
    }

    async handleSuccessfulCharge(customer: any, transactionReference: string, amount: number) {
        const { email } = customer;
    
        try {
          const wallet = await this.walletRepo.findOne({ email });
          if (!wallet) {
            throw new NotFoundException('Wallet not found.');
          }
    
          await this.createAndProcessTransaction(wallet.userId, transactionReference, amount);
        } catch (error) {
          console.error('Error processing Flutterwave charge:', error);
          throw new InternalServerErrorException('An error occurred while processing the charge.');
        }
      }
    
      async createAndProcessTransaction(userId: string, transactionReference: string, amount: number) {
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
    
          const createTransaction = await this.transactionService.createTransaction(transactionData);
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
          const transaction = await this.transactionRepo.findOne({ _id: transactionId });
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
}