import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum paymentStatus {
  Processing = 'processing',
  Pending = 'pending',
  Paid = 'paid',
  Completed = 'completed',
  Canceled = 'canceled',
}

export enum transactionStatus {
  Pending = 'pending',
  Successful = 'successful',
  Failed = 'failed',
}

export enum transactionType {
  WalletFunding = 'fundwallet',
  DebitWallet = 'debitwallet',
  BillPayment = 'billpayment',
  BuyUnit = 'buyunit',
  NINSearch = 'ninsearch',
}

export enum paymentMode {
  wallet = 'wallet',
  paystack = 'paystack',
  account_transfer = 'account_transfer',
}

export class VerifyFundingDto {
  @IsString()
  @ApiProperty()
  userId: string;

  @IsString()
  @ApiProperty()
  transactionId: string;
}

export class BillPaymentTransaction {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  service: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  biller: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  billerId: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  paymentCode: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;

  @IsString()
  @ApiProperty()
  customerCode: string;

  @IsString()
  @ApiProperty()
  category: string;
}

export class BuyUnitTransaction {
  @IsString()
  @ApiProperty()
  service: string;

  @IsString()
  @ApiProperty()
  units: number;

  @IsString()
  @ApiProperty()
  amount: number;

  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;

  @IsString()
  @ApiProperty()
  paymentStatus: paymentStatus.Pending;
}

export class NINTransaction {
  @IsString()
  @ApiProperty()
  service: string;

  @IsString()
  @ApiProperty()
  units: number;

  @IsString()
  @ApiProperty()
  searchItem: string;

  @IsString()
  @ApiProperty()
  paymentStatus: paymentStatus.Pending;
}

export class InitializeWalletFunding {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  paymentMode: paymentMode;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  userId: string;
}

export class QueryDVA {
  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsString()
  @ApiProperty()
  preferred_bank: string;

  @IsString()
  @ApiProperty()
  date: string;
}
export class FundWalletTransaction {
  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;

  @IsString()
  @ApiProperty()
  amount: number;

  @IsString()
  @ApiProperty()
  reference: string;
}

export class TransactionDto {
  @IsString()
  @ApiProperty()
  transactionReference: string;

  @ApiProperty()
  amount: number;

  @IsEnum(transactionType)
  @ApiProperty()
  transactionType: transactionType;

  @IsEnum(transactionStatus)
  @ApiProperty()
  transactionStatus: transactionStatus;

  @IsNotEmpty()
  @ApiProperty()
  @IsEnum(paymentMode)
  paymentMode: paymentMode;

  @IsNotEmpty()
  @ApiProperty()
  transactionDetails: any;

  @IsString()
  @ApiProperty()
  user: string;
}
