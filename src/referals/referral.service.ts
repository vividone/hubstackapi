import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { referralLevels } from './referral.entity';

@Injectable()
export class ReferralService {
  constructor(
    private readonly userRepo: UserRepository
  ) { }
  async processReferral(referralCode: string) {

    const referrer = await this.userRepo.findOne({ referralCode });

    if (referrer) {
      referrer.referralCount += 1;
      await referrer.save();
      await this.updateReferralLevel(referrer);
    }

  }
  private async updateReferralLevel(referrer: any) {
    for (const level of referralLevels) {
      if (referrer.referralCount >= level.criteria) {
        referrer.referralLevel = level.level;
      }
    }
    await referrer.save();
  }
}
