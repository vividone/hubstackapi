import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

}
