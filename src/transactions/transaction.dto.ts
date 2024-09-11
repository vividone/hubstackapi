import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WalletFundingDto } from 'src/wallet/wallet.dto';

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
  ValidateNin = 'validate-nin',
}

export enum paymentMode {
  wallet = 'wallet',
  paystack = 'paystack',
  account_transfer = 'account_transfer',
  units = 'units',
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
  customerId: string;

  @IsString()
  @ApiProperty()
  category: string;

  @IsString()
  ISWTransactionRef: string;
}

export class PaymentValidation {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  transactionDetails: BillPaymentTransaction;
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

export class NINValidateTransaction {
  @IsString()
  @ApiProperty()
  amount: number;

  @IsString()
  @ApiProperty()
  nin: string;
}

export class NINDetailsTransaction {
  @IsString()
  @ApiProperty()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gender: string;
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
  paymentMode: paymentMode | string;

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
  paymentMode: paymentMode | string;

  @IsOptional()
  @ApiProperty()
  transactionDetails:
    | BillPaymentTransaction
    | FundWalletTransaction
    | InitializeWalletFunding
    | NINValidateTransaction
    | NINDetailsTransaction
    | WalletFundingDto
    | string;

  @IsString()
  @ApiProperty()
  user: string;
}
