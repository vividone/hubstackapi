import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMockWalletDto {
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
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  existingBankName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  bvn: string;
}
