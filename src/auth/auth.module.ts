import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';
import { SuperAgentProfileModule } from 'src/super_agent_profile/super_agent_profile.module';
import { InvitationsModule } from 'src/invitations/invitations.module';
import { OtpService } from 'src/mailing/otp.mail';
import { EmailService } from 'src/configs/email.helper';
import { ResetPasswordService } from '../mailing/resetPassword.mail';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletModule } from 'src/wallet/wallet.module';
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
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    InvitationsModule,
    SuperAgentProfileModule,
    AgentProfileModule,
    UsersModule,
    PassportModule,
    WalletModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
