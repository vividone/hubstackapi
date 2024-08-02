import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ReferralController } from './referral.controller';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { ApiKeyModule } from 'src/auth/apikey.module';

@Module({
  providers: [ReferralService, ApiKeyGuard],
  controllers: [ReferralController],
  imports: [UsersModule, JwtModule, ApiKeyModule],
  exports: [ReferralService],
})
export class ReferralModule {}
