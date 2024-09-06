import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}

export class BillPaymentDto {
  @ApiProperty()
  @IsNumber()
  id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;
}

export class BillerCategoriesDto {
  @ApiProperty()
  @IsObject()
  billerCategories: BillPaymentDto[];
}

export class InterswitchCategoryBillers {
  @IsString()
  @ApiProperty()
  type: string;

  @IsNumber()
  @ApiProperty()
  id: number;

  @IsNumber()
  @ApiProperty()
  payDirectProductId: number;

  @IsNumber()
  @ApiProperty()
  payDirectInstitutionId: number;

  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  shortName: string;

  @IsString()
  @ApiProperty()
  narration: string;

  @IsString()
  @ApiProperty()
  customerField1: string;

  @IsString()
  @ApiProperty()
  logoUrl: string;

  @IsString()
  @ApiProperty()
  surcharge: string;

  @IsString()
  @ApiProperty()
  currencyCode: string;

  @IsString()
  @ApiProperty()
  currencySymbol: string;

  @IsString()
  @ApiProperty()
  quickTellerSiteUrlName: string;

  @IsNumber()
  @ApiProperty()
  categoryId: number;

  @IsString()
  @ApiProperty()
  categoryName: string;

  @IsNumber()
  @ApiProperty()
  amountType: number;
}
