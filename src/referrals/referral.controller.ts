import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';

@ApiTags('Referrals')
@Controller('referrals')
@UseGuards(ApiKeyGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('process-referral')
  async testProcessReferral(@Query('referralCode') referralCode: string) {
    await this.referralService.processReferral(referralCode);
    return { message: 'Referral processed' };
  }
}
