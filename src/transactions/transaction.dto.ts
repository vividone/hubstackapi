import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
} from 'class-validator';

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

  @IsEnum(paymentStatus)
  @ApiProperty()
  paymentStatus: paymentStatus.Pending;
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

export class FundWalletTransaction {
  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;

  @IsString()
  @ApiProperty()
  amount: number;

  @IsString()
  @ApiProperty()
  paymentStatus: paymentStatus.Pending;
}

export class Transaction {
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

  @IsNotEmptyObject()
  @ApiProperty()
  transactionDetail:
    | BillPaymentTransaction
    | BuyUnitTransaction
    | NINTransaction
    | FundWalletTransaction;

  @IsString()
  @ApiProperty()
  user: string;
}
