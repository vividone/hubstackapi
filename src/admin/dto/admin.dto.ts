import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/users/users.dto';
export class CreateAdminProfileDto extends CreateUserDto {}
