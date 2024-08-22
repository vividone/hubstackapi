import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}

export class UpdatePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  newPassword: string;
}