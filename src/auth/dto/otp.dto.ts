import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyEmail {
  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}

export class VerifyOtp {
  @ApiProperty()
  @IsNotEmpty()
  otp: string;
}

export class ResendOtp {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
