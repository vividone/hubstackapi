import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWalletDto {

    @IsNotEmpty()
    @IsString()
    firstname: string;

    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsString()
    dateOfBirth: string;

    @IsNotEmpty()
    @IsString()
    BVN: string;

    @IsNotEmpty()
    @IsString()
    mobilenumber: string;

    @IsNotEmpty()
    @IsString()
    homeAddress: string;

}
