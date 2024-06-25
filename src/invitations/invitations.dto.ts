import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Status } from '../enum';

export class CreateInvitationDto {
  @IsString()
  invitersUsername: string;

  @IsString()
  @IsEnum(Status)
  status: Status;

  @IsBoolean()
  isUsed: boolean;

  @IsBoolean()
  isApproved: boolean;
}
