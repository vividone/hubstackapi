import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ReferralController } from './referral.controller';

@Module({
  providers: [ReferralService],
  controllers: [ReferralController],
  imports: [UsersModule, JwtModule],
  exports: [ReferralService],
})
export class InvitationsModule {}
