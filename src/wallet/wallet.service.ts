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

@Injectable()
export class WalletService {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly userRepo: UserRepository,
  ) {}

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

  async getBanks() {
    const baseUrl: string = process.env.PSTK_BASE_URL;
    const secretKey: string = process.env.PSTK_SECRET_KEY;
    try {
      const response = await axios.get(`${baseUrl}/bank`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      const banks = { data: response.data.data, message: 'Sucessfull' };

      return banks;
    } catch (error) {
      this.handleAxiosError(
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
      this.handleAxiosError(
        error,
        'An error occurred while retrieving the bank code',
      );
    }
  }

  // Validate customer

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
        const newAccountNumber = this.generateAccountNumber();
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
      this.handleAxiosError(
        error,
        'An error occurred while creating customer and account',
      );
    }
  }

  async getUserWallet(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    const convertedUserId = new Types.ObjectId(userId);
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
      this.handleAxiosError(
        error,
        'An error occurred while creating the customer',
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

  private generateAccountNumber(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
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

  private async validateCustomer(validatePayload: any) {
    const baseUrl: string = process.env.PSTK_BASE_URL;
    const secretKey: string = process.env.PSTK_SECRET_KEY;

    console.log('Validaate Payload: ', validatePayload);

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
      console.log(response);

      return resolves;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving the bank details',
      );
    }
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

  // Flutterwave Implementation

  // async createSubaccount(data: CreateWalletDto, id: string) {
  //   const baseUrl: string = process.env.FLW_BASE_URL;
  //   const secretKey: string = process.env.FLW_SECRET_KEY;
  //   try {
  //     const user = await this.userRepo.findOne({ _id: id });

  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     const email: string = user.email;
  //     const account_reference: string = this.generateAccountReference();
  //     const country = 'NG';

  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const { bvn, ...rest } = data;
  //     const requestData = {
  //       email,
  //       account_name: `${data.firstname} ${data.lastname}`,
  //       account_reference,
  //       country,
  //     };
  //     console.log('DATA TO FLW', requestData);

  //     const response = await axios.post(
  //       `${baseUrl}/payout-subaccounts`,
  //       requestData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${secretKey}`,
  //           'Content-Type': 'application/json',
  //         },
  //       },
  //     );

  //     console.log('RESPONSE FROM FLW', response);

  //     const { nuban, account_name, bank_code, bank_name } = response.data.data;

  //     const createdSubaccount = {
  //       email: email,
  //       accountName: account_name,
  //       accountNumber: nuban,
  //       bankName: bank_name,
  //       bankCode: bank_code,
  //       accountReference: account_reference,
  //       user: user._id,
  //     };

  //     const savedSubaccount = await this.walletRepo.create(createdSubaccount);

  //     return {
  //       message: 'Subaccount created successfully',
  //       data: savedSubaccount,
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

  // async getAStaticAccount(accountReference: string) {
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

  // async getAStaticAccount(accountReference: string) {
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
}
