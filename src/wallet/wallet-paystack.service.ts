import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
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
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';

@Injectable()
export class PaystackWalletService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly userRepo: UserRepository,
        private readonly walletService: WalletService,
        private readonly transactionRepo: TransactionRepository,
        private readonly transactionService: TransactionService,
    ) { }


    async getBanks() {
        const baseUrl: string = process.env.PSTK_BASE_URL;
        const secretKey: string = process.env.PSTK_SECRET_KEY;
        try {
            const response = await axios.get(`${baseUrl}/bank`, {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
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
        const baseUrl: string = process.env.PSTK_BASE_URL;
        const secretKey: string = process.env.PSTK_SECRET_KEY;
        try {
            const response = await axios.get(`${baseUrl}/bank`, {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
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
        const baseUrl = process.env.PSTK_BASE_URL;
        const secretKey = process.env.PSTK_SECRET_KEY;
        const reference = this.transactionService.generateTransactionReference();
        const data = {
            email: initializeWalletFunding.email,
            amount: initializeWalletFunding.amount,
            reference: reference,
        };
        // console.log('data sent to paystack', initializeWalletFunding);
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

    async createCustomerWallet(data: CreateWalletDto, id: string) {
        const baseUrl: string = process.env.PSTK_BASE_URL;
        const secretKey: string = process.env.PSTK_SECRET_KEY;
        const { bvn, existingAccountNumber, existingBankName } = data;

        try {
            const user = await this.userRepo.findOne({ _id: id });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const email: string = user.email;
            const first_name: string = user.firstname;
            const last_name: string = user.lastname;
            const phone: string = user.mobilenumber;

            const customer = await this.createCustomer(
                user._id,
                baseUrl,
                secretKey,
                email,
                first_name,
                last_name,
                phone,
            );
            const bankCode = await this.getBankCode(existingBankName);
            // console.log('Bank Code', bankCode);
            // Validate customer
            const validatePayload = {
                country: 'NG',
                bvn: bvn,
                bank_code: bankCode,
                account_number: existingAccountNumber,
            };

            const validateCustomer = validatePayload; // Mock Validation

            if (!validateCustomer) {
                throw new BadRequestException('Could not validate Customer');
            }

            //TODO: SET USER KYC TO TRUE AFTER VALIDATION
            if (process.env.ENV === 'development') {
                const newAccountNumber = this.walletService.generateAccountNumber();
                const dvaData = this.createDvaData(
                    customer.customer_id,
                    newAccountNumber,
                );
                await this.walletRepo.create({
                    accountName: `HUBSTACK / ${data.firstname} ${data.lastname} `,
                    customer_id: customer.customer_id,
                    customerCode: customer.customer_code,
                    accountNumber: dvaData.accountNumber,
                    bankName: dvaData.preferred_bank,
                    country: validatePayload.country,
                    user: user,
                });

                return {
                    message: 'Customer and Wallet created successfully',
                    customer,
                    dva: dvaData,
                };
            } else {
                // Paystack live account generation
                const newAccountNumber = await this.createDVAccount(
                    customer.customer_id,
                );
                const dvaData = this.createDvaData(
                    customer.customer_id,
                    newAccountNumber,
                );

                await this.walletRepo.create({
                    accountName: `HUBSTACK / ${data.firstname} ${data.lastname} `,
                    customer_id: customer.customer_id,
                    customerCode: customer.customer_code,
                    accountNumber: dvaData.accountNumber,
                    bankName: dvaData.preferred_bank,
                    country: validatePayload.country,
                    user: user,
                });

                return {
                    message: 'Customer and Wallet created successfully',
                    customer,
                    dva: dvaData,
                    kycResult: validateCustomer,
                };
            }
        } catch (error) {
            handleAxiosError(
                error,
                'An error occurred while creating customer and account',
            );
        }
    }

    //WEBHOOKS 
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

    private async createCustomer(
        userId: string,
        baseUrl: string,
        secretKey: string,
        email: string,
        first_name: string,
        last_name: string,
        phone: string,
    ) {
        try {
            const response = await axios.post(
                `${baseUrl}/customer`,
                { email, first_name, last_name, phone },
                {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
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
            handleAxiosError(
                error,
                'An error occurred while creating the customer',
            );
        }
    }

    private async validateCustomer(validatePayload: any) {
        const baseUrl: string = process.env.PSTK_BASE_URL;
        const secretKey: string = process.env.PSTK_SECRET_KEY;

        // console.log('Validaate Payload: ', validatePayload);

        const { account_number, bank_code } = validatePayload;

        try {
            const response = await axios.get(
                `${baseUrl}/resolve?account_number=${account_number}&bank_code=${bank_code}`,
                {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
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
                'An error occurred while retrieving the bank details',
            );
        }
    }


    private createDvaData(customerId: string, accountNumber: string) {
        return {
            customer: customerId,
            preferred_bank: 'mock-bank',
            accountNumber,
        };
    }
    private async createDVAccount(customerId: string) {
        const baseUrl: string = process.env.PSTK_BASE_URL;
        const secretKey: string = process.env.PSTK_SECRET_KEY;
        const dvaPayload = {
            customer: customerId,
            preferred_bank: 'wema-bank',
        };

        const dvaResponse = await axios.post(
            `${baseUrl}/dedicated_account`,
            dvaPayload,
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return dvaResponse.data;
    }

}