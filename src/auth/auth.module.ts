import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ConfigService ],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '1h' },
      }),
    }),
    AgentProfileModule,
    UsersModule,
    PassportModule,
  ],
  exports: [AuthService]
})
export class AuthModule {}
