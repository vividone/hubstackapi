import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class CreateAdminProfileDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    role: 'Admin';
}


