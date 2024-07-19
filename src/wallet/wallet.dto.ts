import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsObject, IsString } from 'class-validator';

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
  bvn: string;
}

export class Bank {
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
