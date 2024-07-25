import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';
import { ReferralModule } from 'src/referrals/referral.module';
import { OtpService } from 'src/mailing/otp.mail';
import { EmailService } from 'src/configs/email.helper';
import { ResetPasswordService } from '../mailing/resetPassword.mail';
import { WalletModule } from 'src/wallet/wallet.module';
import { MockWalletModule } from 'src/mock-wallet/mock-wallet.module';
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ConfigService,
    OtpService,
    EmailService,
    ResetPasswordService,
  ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ReferralModule,
    AgentProfileModule,
    UsersModule,
    PassportModule,
    WalletModule,
    MockWalletModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
