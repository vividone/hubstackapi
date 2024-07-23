import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Super Agent Operations')
@Controller('referrals')
export class ReferralController {
  constructor(
    private readonly referralService: ReferralService,
  ) {}


  @Get('process-referral')
  async testProcessReferral(@Query('referralCode') referralCode: string) {
    await this.referralService.processReferral(referralCode);
    return { message: 'Referral processed' };
  }
 
}
