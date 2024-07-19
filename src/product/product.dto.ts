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
