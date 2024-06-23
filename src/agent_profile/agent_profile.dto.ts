import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { CreateUserDto } from 'src/users/users.dto';
export class CreateAgentProfileDto extends CreateUserDto {

    @IsNotEmpty()
    @IsString()
    referal_username: string;

    @IsNotEmpty()
    @IsString()
    business_username: string;
    
    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsString()
    region: string;
    
}