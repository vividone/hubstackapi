import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './create.wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { first } from 'rxjs';

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

  async createCustomerWallet(data: CreateWalletDto, id: string) {
    const baseUrl: string = process.env.PSTK_BASE_URL;
    const secretKey: string = process.env.PSTK_SECRET_KEY;

    try {
        const user = await this.userRepo.findOne({ _id: id });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const email: string = user.email;

        const { bvn, ...rest } = data;
        const payLoad = {
            email,
            ...rest,
        };

        // Create customer
        const customerResponse = await axios.post(
            `${baseUrl}/customer`,
            payLoad,
            {
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        const { id: customerId, customer_code: customerCode, integration } = customerResponse.data.data;

        const createdCustomer = {
            email: email,
            customer_code: customerCode,
            customer_id: customerId,
            integration: integration,
            user: user._id,
        };

        const savedCustomer = createdCustomer;

        const dvaPayload = {
            customer: customerId,
            preferred_bank: "wema-bank", 
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

        const dvaData = dvaResponse.data.data;

        return {
            message: 'Customer and DVA created successfully',
            customer: savedCustomer,
            dva: dvaData,
        };
    } catch (error) {
        if (error.response) {
            console.error('Error response data:', error.response.data);
            throw new Error(
                error.response.data.message || 'An error occurred while creating customer and DVA',
            );
        } else if (error.request) {
            console.error('Error request:', error.request);
            throw new Error('No response received from the server');
        } else {
            console.error('Error message:', error.message);
            throw new Error('An error occurred while creating customer and DVA');
        }
    }
}


  // Paystack Implementation

  

  // Flutterwave Implementation

  async createSubaccount(data: CreateWalletDto, id: string) {
    const baseUrl: string = process.env.FLW_BASE_URL;
    const secretKey: string = process.env.FLW_SECRET_KEY;
    try {
      const user = await this.userRepo.findOne({ _id: id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const email: string = user.email;
      const account_reference: string = this.generateAccountReference();
      const country = 'NG';

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {  bvn, ...rest } = data;
      const requestData = {
        email,
        account_name: `${data.firstname} ${data.lastname}`,
        account_reference,
        country,
      };
      console.log('DATA TO FLW', requestData);

      const response = await axios.post(
        `${baseUrl}/payout-subaccounts`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('RESPONSE FROM FLW', response);

      const { nuban, account_name, bank_code, bank_name } = response.data.data;

      const createdSubaccount = {
        email: email,
        accountName: account_name,
        accountNumber: nuban,
        bankName: bank_name,
        bankCode: bank_code,
        accountReference: account_reference,
        user: user._id,
      };

      const savedSubaccount = await this.walletRepo.create(createdSubaccount);

      return {
        message: 'Subaccount created successfully',
        data: savedSubaccount,
      };
    } catch (error) {
      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(
          error.response.data.message ||
            'An error occurred while creating subaccount',
        );
      } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('No response received from the server');
      } else {
        console.error('Error message:', error.message);
        throw new Error('An error occurred while creating subaccount');
      }
    }
  }

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
        },
      );

      return {
        message: 'Balance fetched successfully',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(
          error.response.data.message ||
            'An error occurred while fetching balance',
        );
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
        },
      );

      return {
        message: 'Balance fetched successfully',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(
          error.response.data.message ||
            'An error occurred while fetching balance',
        );
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
        },
      );

      return {
        message: 'Account fetched successfully',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(
          error.response.data.message ||
            'An error occurred while fetching balance',
        );
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
      const response = await axios.get(`${baseUrl}/payout-subaccounts`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        message: 'Accounts fetched successfully',
        data: response.data.data,
      };
    } catch (error) {
      console.error('Error:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        throw new Error(
          error.response.data.message ||
            'An error occurred while fetching balance',
        );
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
