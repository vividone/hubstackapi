import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;

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
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone_number: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  avatar: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  referralCode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  role: string;
}
