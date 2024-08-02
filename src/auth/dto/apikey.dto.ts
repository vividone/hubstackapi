import { IsNotEmpty, IsString } from 'class-validator';

export class generateApiKey {
  @IsNotEmpty()
  @IsString()
  appname: string;
}
