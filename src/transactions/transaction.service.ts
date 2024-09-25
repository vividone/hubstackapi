/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import {
  BillPaymentTransaction,
  BuyUnitTransaction,
  NINDetailsTransaction,
  NINValidateTransaction,
  paymentMode,
  paymentStatus,
  QueryDVA,
  TransactionDto,
  transactionStatus,
  transactionType,
} from './transaction.dto';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { NotificationMailingService } from 'src/mailing/notification.mails';
import { NinService } from 'src/product/nin.service';
@Injectable()
export class TransactionService {
  constructor(
    private readonly userService: UsersService,
    private readonly ninService: NinService,
    private readonly transactionRepo: TransactionRepository,
    private readonly walletRepo: WalletRepository,
    private readonly notificationMailingService: NotificationMailingService,
  ) {}
  private readonly TerminalId = process.env.ISW_TERMINAL_ID;

  async getAllTransactions() {
    const transactions = await this.transactionRepo.find();
    return transactions;
  }

  async getATransaction(id: string) {
    const transactions = await this.transactionRepo.findOne({ _id: id });
    return transactions;
  }

  async getTransactions(userId: string, transactionType: string) {
    const transactions = await this.transactionRepo.find({
      user: userId,
      transactionType: transactionType,
    });
    return transactions;
  }

  async getUserWallet(userId: string) {
    // console.log('convertedUserId', convertedUserId);
    try {
      const wallet = await this.walletRepo.findOne({
        user: userId,
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

  async getWalletTransactions(userId: string) {
    const transactions = await this.transactionRepo.find({
      user: userId,
      transactionType: { $in: ['wallet-funding', 'fundwallet', 'debitwallet'] },
    });
    return transactions;
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await this.transactionRepo.findOne({
      user: userId,
      transactionId: transactionId,
    });
    return transaction;
  }

  // async findTransactionByUserId(userId: any) {
  //   const convertedId = userId.toString();
  //   return this.transactionRepo.findOne({ user: convertedId });
  // }

  async payBills(billPaymentDto: BillPaymentTransaction, userId: string) {
    const { paymentCode, customerId } = billPaymentDto;

    // Validate Customer
    const validateCustomer = await this.validateCustomer(
      paymentCode,
      customerId,
    );

    if (!validateCustomer) {
      return 'Customer data is invalid';
    }

    const reference = this.generateRequestReference();

    const transactionData = {
      transactionReference: reference,
      amount: billPaymentDto.amount,
      transactionType: transactionType.BillPayment,
      transactionStatus: transactionStatus.Pending,
      paymentMode: billPaymentDto.paymentMode,
      transactionDetails: billPaymentDto,
      user: userId,
    };

    const createTransaction = await this.createTransaction(transactionData);

    return createTransaction;
  }

  // async payBills(billPaymentDto: BillPaymentTransaction, userId: string) {
  //   const { paymentCode, customerId } = billPaymentDto;

  //   //Validate Customer
  //   const validateCustomer = await this.validateCustomer(
  //     paymentCode,
  //     customerId,
  //   );

  //   // if (!validateCustomer) {
  //   //   return 'Customer data is invalid';
  //   // } else {
  //   //   //
  //   //   if (paymentMode.wallet) {
  //   //     const payWithWallet = await this.processBillPaymentViaWallet(
  //   //       billPaymentDto,
  //   //       userId,
  //   //     );

  //   //     if (payWithWallet.transactionStatus === transactionStatus.Successful) {
  //   //       const reference = this.generateRequestReference();
  //   //       const transactionData = {
  //   //         transactionReference: reference,
  //   //         amount: billPaymentDto.amount,
  //   //         transactionType: transactionType.BillPayment,
  //   //         transactionStatus: transactionStatus.Pending,
  //   //         paymentMode: billPaymentDto.paymentMode,
  //   //         transactionDetails: billPaymentDto,
  //   //         user: userId,
  //   //       };
  //   //       const createTransaction =
  //   //         await this.createTransaction(transactionData);
  //   //       return createTransaction
  //     }
  // }

  //buying airtime and data function
  async payPhoneBills(billPaymentDto: BillPaymentTransaction, userId: string) {
    try {
      const { customerId, amount, paymentMode } = billPaymentDto;

      if (!amount || !paymentMode || !customerId) {
        throw new BadRequestException('Required payment details are missing');
      }

      const user = await this.userService.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const email = user.email;
      const reference = this.generateRequestReference();

      const transactionData = {
        transactionReference: reference,
        amount,
        transactionType: transactionType.BillPayment,
        transactionStatus: transactionStatus.Pending,
        paymentMode,
        transactionDetails: billPaymentDto,
        user: userId,
      };

      console.log('dto: ', billPaymentDto);

      console.log('Transaction Data:', transactionData);

      const createTransaction = await this.createTransaction(transactionData);
      const { transactionDetails, _id } = createTransaction;

      if (!transactionDetails || !_id) {
        console.error('Transaction creation failed:', createTransaction);
        throw new Error('Transaction creation failed');
      }

      const transactionId = _id.toString();

      const response = await this.sendPaymentAdvice(
        transactionDetails,
        userId,
        transactionId,
      );

      if (response.success) {
        return {
          status: 'Success',
          message: 'Payment processed successfully',
          transaction: response.transaction,
        };
      } else {
        console.error('Payment advice error:', response);
        throw new Error(
          `Payment advice failed with message: ${response.message}`,
        );
      }
    } catch (error) {
      console.error('Error processing phone bill payment:', error);
      throw new Error(
        'An error occurred while processing the phone bill payment: ' +
          error.message,
      );
    }
  }

  async ninValidate(ninDto: NINValidateTransaction, userId: string) {
    const reference = this.generateRequestReference();
    const { amount } = ninDto;

    try {
      await this.debitWallet(userId, amount);
    } catch (error) {
      throw new Error(
        'Unable to debit wallet. Please ensure sufficient balance.',
      );
    }

    let response: any;
    try {
      response = await this.ninService.validateNIN(ninDto.nin);
    } catch (error) {
      throw new Error(
        'NIN validation failed. Please verify the NIN and try again.',
      );
    }

    const transactionData = {
      transactionReference: reference,
      amount: ninDto.amount,
      transactionType: transactionType.ValidateNin,
      transactionStatus: transactionStatus.Successful,
      paymentStatus: paymentStatus.Completed,
      transactionDetails: { ...ninDto, nin: undefined },
      paymentMode: paymentMode.wallet,
      user: userId,
    };

    let createdTransaction: any;
    try {
      createdTransaction = await this.createTransaction(transactionData);
    } catch (error) {
      throw new Error(
        'Failed to create transaction record. Please try again later.',
      );
    }

    return {
      response,
      transaction: createdTransaction,
    };
  }

  async ninDetails(userDetails: NINDetailsTransaction, userId: string) {
    const reference = this.generateRequestReference();
    const { amount } = userDetails;
    const { firstname, lastname, gender, dateOfBirth } = userDetails;

    try {
      await this.debitWallet(userId, amount);
    } catch (error) {
      throw new Error(
        'Unable to debit wallet. Please ensure sufficient balance.',
      );
    }

    let response: any;
    try {
      response = await this.ninService.getNIN(userDetails);
    } catch (error) {
      throw new Error(
        'NIN validation failed. Please verify the NIN and try again.',
      );
    }

    const transactionData = {
      transactionReference: reference,
      amount: userDetails.amount,
      transactionType: transactionType.NINSearch,
      transactionStatus: transactionStatus.Successful,
      paymentStatus: paymentStatus.Completed,
      transactionDetails: userDetails,
      paymentMode: paymentMode.wallet,
      user: userId,
    };

    let createdTransaction: any;
    try {
      createdTransaction = await this.createTransaction(transactionData);
    } catch (error) {
      throw new Error(
        'Failed to create transaction record. Please try again later.',
      );
    }
    return {
      response,
      transaction: createdTransaction,
    };
  }

  async buyUnits(buyUnitsDto: BuyUnitTransaction, userId: string) {
    const reference = this.generateRequestReference();

    const transactionData = {
      transactionReference: reference,
      amount: buyUnitsDto.amount,
      transactionType: transactionType.BuyUnit,
      transactionStatus: transactionStatus.Pending,
      paymentStatus: paymentStatus.Pending,
      transactionDetails: buyUnitsDto,
      paymentMode: paymentMode.wallet,
      user: userId,
    };
    return transactionData;
  }

  async queryDVA(queryDva: QueryDVA) {
    const baseUrl = process.env.PSTK_BASE_URL;
    const secretKey = process.env.PSTK_SECRET_KEY;
    const { accountNumber, preferred_bank, date } = queryDva;

    try {
      const response = await axios.get(
        `${baseUrl}/dedicated_account/requery?account_number=${accountNumber}&provider_slug=${preferred_bank}&date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data;
    } catch (error) {
      this.handleAxiosError(error, 'Error funding wallet ');
    }
  }

  //TOD: COMPLETE THIS AND INTEGRATE IN PAYBILLS
  async sendPaymentAdvice(
    transactionDetails: any,
    userId: string,
    transactionId: string,
  ) {
    const baseUrl = process.env.ISW_BASE_URL;
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      const customerEmail = user.email;
      const {
        paymentCode,
        customerId,
        customerMobile,
        amount,
        requestReference,
      } = transactionDetails;

      const amountInKobo = this.convertToKobo(amount);
      const data = {
        customerEmail,
        paymentCode,
        customerId,
        customerMobile,
        amount: amountInKobo,
        requestReference,
      };

      const authResponse = await this.genISWAuthToken();
      const token = authResponse.access_token;
      const url = `${baseUrl}/Transactions`;

      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          TerminalId: this.TerminalId,
        },
      });

      console.log('data: ', response.data);

      if (response.data.ResponseDescription === 'Success') {
        const updateTransactionData = {
          transactionStatus: transactionStatus.Successful,
          paymentStatus: paymentStatus.Completed,
        };
        await this.debitWallet(userId, amount);
        const updatedTransaction = await this.updateTransaction(
          transactionId,
          updateTransactionData,
        );
        const formattedTransactionData = `
        Transaction Reference: ${updatedTransaction.transactionReference}\n
        Amount: ${updatedTransaction.amount}\n
        Type: ${updatedTransaction.transactionType}\n
      `;
        await this.notificationMailingService.sendTransactionSummary(
          customerEmail,
          formattedTransactionData,
        );

        return { success: true, transaction: updatedTransaction };
      } else {
        return { success: false, message: response.data.ResponseDescription };
      }
    } catch (error) {
      this.handleAxiosError(error, 'Error sending payment advice');
      return { success: false, message: error.message };
    }
  }

  public async verifyPSTKPayment(reference: string) {
    const baseUrl = process.env.PSTK_BASE_URL;
    const secretKey = process.env.PSTK_SECRET_KEY;
    try {
      const verifyResponse = await axios.get(
        `${baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(verifyResponse.data);
      return verifyResponse.data;
    } catch (error) {
      this.handleAxiosError(error, 'error verifying payment');
    }
  }

  public async verifyFLWPayment(reference: string) {
    const baseUrl = process.env.FLW_BASE_URL;
    const secretKey = process.env.FLW_SECRET_KEY;
    try {
      const verifyResponse = await axios.get(
        `${baseUrl}/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(verifyResponse.data);
      return verifyResponse.data;
    } catch (error) {
      this.handleAxiosError(error, 'error verifying payment');
    }
  }

  public async processBillPaymentViaWallet(
    billPaymentDto: BillPaymentTransaction,
    userId: string,
  ) {
    const { amount } = billPaymentDto;

    try {
      const payment = await this.debitWallet(userId, amount);
      return payment;
    } catch (error) {
      throw new Error(
        'An error occurred while processing bill payment via wallet: ' +
          error.message,
      );
    }
  }

  public async debitWallet(userId: string, chargeAmount: number) {
    try {
      const walletBalance = await this.getUserWallet(userId);
      const { balance, _id } = walletBalance;

      if (balance < chargeAmount) {
        throw new Error('Insufficient Wallet Balance');
      } else if (balance >= chargeAmount) {
        const newBalance = balance - chargeAmount;

        const updateWallet = await this.walletRepo.findOneAndUpdate(
          { _id: _id },
          { balance: newBalance },
        );

        if (updateWallet) {
          const ref = this.generateTransactionReference();
          const transactionData = {
            transactionType: transactionType.DebitWallet,
            transactionStatus: transactionStatus.Successful,
            transactionReference: ref,
            amount: chargeAmount,
            user: userId,
            transactionDetails: 'Wallet Debit',
            paymentMode: paymentMode.wallet,
          };

          const debitWalletResponse =
            await this.createTransaction(transactionData);
          return debitWalletResponse;
        } else {
          throw new Error('Failed to update wallet');
        }
      }
    } catch (error) {
      throw new Error(
        'An error occurred while debiting wallet: ' + error.message,
      );
    }
  }

  private async getTransactionStatusFromISW(
    token: string,
    requestReference: string,
    TerminalId: string,
  ) {
    const baseUrl = process.env.ISW_BASE_URL;
    const url = `${baseUrl}/Transactions?requestRef=${requestReference}`;
    console.log(token, requestReference, this.TerminalId);
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        TerminalId: this.TerminalId,
      },
    });
    return response.data;
  }

  private handleAxiosError(error: any, defaultMessage: string) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, statusText, data } = error.response;
      console.error('HTTP Error:', defaultMessage, status, statusText, data);
      throw new BadRequestException({
        message: defaultMessage,
        statusCode: status,
        statusText: statusText,
        details: data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server', error.request);
      throw new InternalServerErrorException(
        'No response received from the server',
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new InternalServerErrorException(defaultMessage);
    }
  }

  public async createTransaction(transactionDto: TransactionDto) {
    // const createdAt = new Date();

    // const finalData = {
    //   ...transactionDto,
    //   createdAt: createdAt,
    // };
    try {
      const createTransaction =
        await this.transactionRepo.create(transactionDto);
      return createTransaction;
    } catch (error) {
      this.handleAxiosError(error, 'Error creating transaction!');
    }
  }

  public async updateTransaction(transactionId: string, updateData: any) {
    try {
      const createTransaction = await this.transactionRepo.findOneAndUpdate(
        { _id: transactionId },
        { $set: updateData },
      );

      return createTransaction;
    } catch (error) {
      this.handleAxiosError(error, 'Error updating transaction!');
    }
  }
  private async genISWAuthToken() {
    const baseUrl: string = process.env.ISW_PASSAUTH_URL;
    const secKey: string = process.env.ISW_SECRET_KEY;
    const clientId: string = process.env.ISW_CLIENT_ID;
    const data = 'grant_type=client_credentials&scope=profile';

    try {
      const response = await axios.post(`${baseUrl}`, data, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data;
    } catch (error) {
      this.handleAxiosError(error, 'An error occurred authenticating!');
    }
  }

  private async validateCustomer(paymentCode: string, customerId: string) {
    const TerminalId: string = process.env.ISW_TERMINAL_ID;
    const baseUrl: string = process.env.ISW_BASE_URL;

    const validatePayload = {
      customers: [
        {
          PaymentCode: paymentCode,
          CustomerId: customerId,
        },
      ],
      TerminalId: this.TerminalId,
    };

    let token: string;
    const url = `${baseUrl}/Transactions/validatecustomers`;

    try {
      const authResponse = await this.genISWAuthToken();
      token = authResponse.access_token;
      // console.log(token)
    } catch (error) {
      console.error('Error fetching auth token:', error.message);
      throw new Error('Failed to authenticate');
    }

    try {
      const response = await axios.post(url, validatePayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          TerminalId: this.TerminalId,
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving billers',
      );
    }
  }

  public generateTransactionReference(): string {
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

  private generateRequestReference(): string {
    let referenceCode = Math.floor(
      1000000000 + Math.random() * 900000000,
    ).toString();
    for (let i = referenceCode.length; i < 10; i++) {
      referenceCode = '0' + referenceCode;
    }

    return referenceCode;
  }

  private convertToKobo(amount: number) {
    const converted = amount * 100;
    return converted;
  }

  private convertToNaira(amount: number) {
    const converted = amount * 100;
    return converted;
  }
}
