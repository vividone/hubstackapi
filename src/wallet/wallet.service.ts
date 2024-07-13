import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './create.wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class WalletService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly userRepo: UserRepository
    ) {}

    async createSubaccount(data: CreateWalletDto, id: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
        try {
            const user = await this.userRepo.findOne({_id: id });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const email : string = user.email;
            let account_reference : string = this.generateAccountReference();
            const country = 'NG';

            const { dateOfBirth, BVN, homeAddress, ...rest } = data;
            const requestData = {
                email,
                account_name: `${data.firstname} ${data.lastname}`,
                account_reference,
                country,
                ...rest
            };

            const response = await axios.post(
                `${baseUrl}/payout-subaccounts`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const { nuban, account_name, bank_code, bank_name } = response.data.data;

            const createdSubaccount = {
                email: email,
                accountName: account_name,
                accountNumber: nuban,
                bankName: bank_name,
                bankCode: bank_code,
                accountReference: account_reference,
                homeAddress: data.homeAddress,
                user: user._id
            };

            const savedSubaccount = await this.walletRepo.create(createdSubaccount);

            return {
                message: 'Subaccount created successfully',
                data: savedSubaccount,
            };
        } catch (error) {
            if (error.response) {
                console.error('Error response data:', error.response.data);
                throw new Error(error.response.data.message || 'An error occurred while creating subaccount');
            } else if (error.request) {
                console.error('Error request:', error.request);
                throw new Error('No response received from the server');
            } else {
                console.error('Error message:', error.message);
                throw new Error('An error occurred while creating subaccount');
            }
        }
    }

    async getSubaccountBalance(accountReference: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
        try {
          const response = await axios.get(
            `${baseUrl}/payout-subaccounts/${accountReference}/balances`,
            {
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
    
          return {
            message: 'Balance fetched successfully',
            data: response.data.data,
          };
        } catch (error) {
          console.error('Error:', error);
    
          if (error.response) {
            console.error('Error response data:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred while fetching balance');
          } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from the server');
          } else {
            console.error('Error message:', error.message);
            throw new Error('An error occurred while fetching balance');
          }
        }
      }

      async getSubaccountBalanceOnLogin(userId: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
        try {
    
          const wallet = await this.walletRepo.findOne({ user: userId });
    
          if (!wallet || !wallet.accountReference) {
            throw new Error('Wallet or account reference not found for the user');
          }
    
          const accountReference = wallet.accountReference;
          const response = await axios.get(
            `${baseUrl}/payout-subaccounts/${accountReference}/balances`,
            {
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
    
          return {
            message: 'Balance fetched successfully',
            data: response.data.data,
          };
        } catch (error) {
          console.error('Error:', error);
    
          if (error.response) {
            console.error('Error response data:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred while fetching balance');
          } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from the server');
          } else {
            console.error('Error message:', error.message);
            throw new Error('An error occurred while fetching balance');
          }
        }
      }

      async getAStaticAccount(accountReference: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
    
        try {
          const response = await axios.get(
            `${baseUrl}/payout-subaccounts/${accountReference}/static-account`,
            {
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
    
          return {
            message: 'Account fetched successfully',
            data: response.data.data,
          };
        } catch (error) {
          console.error('Error:', error);
    
          if (error.response) {
            console.error('Error response data:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred while fetching balance');
          } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from the server');
          } else {
            console.error('Error message:', error.message);
            throw new Error('An error occurred while fetching balance');
          }
        }
      }

      async getAllStaticAccounts() {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
    
        try {
          const response = await axios.get(
            `${baseUrl}/payout-subaccounts`,
            {
              headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
              },
            }
          );
    
          return {
            message: 'Accounts fetched successfully',
            data: response.data.data,
          };
        } catch (error) {
          console.error('Error:', error);
    
          if (error.response) {
            console.error('Error response data:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred while fetching balance');
          } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from the server');
          } else {
            console.error('Error message:', error.message);
            throw new Error('An error occurred while fetching balance');
          }
        }
      }

    private generateAccountReference(): string {
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

    async getUserWallet(userId: string) {
      return this.walletRepo.findOne({ user: userId });
    }
}
