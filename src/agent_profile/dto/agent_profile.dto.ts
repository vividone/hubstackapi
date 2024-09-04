import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/users.dto';
export class CreateAgentProfileDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  business_name: string;

  @IsNotEmpty()
  @IsString()
  CAC: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  operationAddress: string;
}


