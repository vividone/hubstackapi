import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { paymentMode } from 'src/transactions/transaction.dto';

export class CreateWalletDto {
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
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  mobilenumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  existingAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  existingBankName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  bvn: string;
}

class Bank {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  slug: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  longcode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gateway: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  pay_with_bank: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  supports_transfer: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  active: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  currency: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  is_deleted: boolean;
}

export class Banks {
  @ApiProperty({ type: [Bank] })
  @IsObject({ each: true })
  Banks: Bank[];
}

export class ValidateCustomerDto {
  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsString()
  accountNumber: string;
}

export class ValidateCustomerResponse {
  @ApiProperty()
  @IsBoolean()
  status: boolean;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsObject()
  data: any;
}

export class dataObjectResp {
  @ApiProperty()
  @IsString()
  account_number: string;

  @ApiProperty()
  @IsString()
  account_name: string;

  @ApiProperty()
  @IsNumber()
  bank_id: number;
}

export class WalletFundingDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  transactionReference: string;

  @IsEnum(paymentMode)
  @ApiProperty()
  paymentMode: paymentMode;
}

export class BankAccount {
  @IsString()
  @ApiProperty()
  accountName: string;

  @IsString()
  @ApiProperty()
  accountNumber: string;

  @IsString()
  @ApiProperty()
  accountReference: string;

  @IsString()
  @ApiProperty()
  bankName: string;

  @IsString()
  @ApiProperty()
  bank_slug: string;

  @IsString()
  @ApiProperty()
  provider: string;
}
