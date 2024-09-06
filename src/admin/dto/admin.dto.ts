import { IsNotEmpty, IsString } from 'class-validator';
export class CreateAdminProfileDto {
    @IsNotEmpty()
    @IsString()
    email: string;
  
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    role: 'Admin';
}


