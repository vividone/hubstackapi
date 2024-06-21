import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { CreateUserDto } from 'src/users/users.dto';


export class CreateSuperAgentDto extends CreateUserDto {

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
