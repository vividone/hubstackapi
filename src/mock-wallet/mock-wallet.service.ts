import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { CreateMockWalletDto } from './mock.wallet.dto';
import { MockWalletRepository } from 'src/entity/repositories/mock.wallet.repo';

@Injectable()
export class MockWalletService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly mockWalletRepo: MockWalletRepository,
  ) {}

  async createCustomerWallet(data: CreateMockWalletDto, id: string) {
    const baseUrl: string = process.env.PSTK_BASE_URL;
    const secretKey: string = process.env.PSTK_SECRET_KEY;
    const { bvn, existingAccountNumber, existingBankName, ...rest } = data;

    try {
      const user = await this.userRepo.findOne({ _id: id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const email: string = user.email;

      const customer = await this.createCustomer(
        user._id,
        baseUrl,
        secretKey,
        email,
        rest,
      );
      const bankCode = await this.getBankCode(existingBankName);

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

      const newAccountNumber = this.generateAccountNumber();
      const dvaData = this.createDvaData(
        customer.customer_id,
        newAccountNumber,
      );

      await this.mockWalletRepo.create({
        accountName: `HUBSTACK / ${data.firstname} ${data.lastname} `,
        customer_id: customer.customer_id,
        customerCode: customer.customer_code,
        accountNumber: dvaData.accountNumber,
        bankName: 'Wema Bank',
        country: validatePayload.country,
        user: user,
      });

      return {
        message: 'Customer and Wallet created successfully',
        customer,
        dva: dvaData,
        kycResult: validateCustomer,
      };
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while creating customer and account',
      );
    }
  }

  private async createCustomer(
    userId: string,
    baseUrl: string,
    secretKey: string,
    email: string,
    data: any,
  ) {
    try {
      const response = await axios.post(
        `${baseUrl}/customer`,
        { email, ...data },
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
}
