import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CostType } from 'src/enum';

export class ProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(CostType)
  @ApiProperty({ enum: CostType })
  costType: CostType;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  price: number;
}

export class NinDto{
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  nin: string;
}
export class NinDataDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  dateOfBirth: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  gender: string;
}
