import { Inject, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AdminProfileModule } from './admin_profile/admin_profile.module';
import { SuperAgentProfileModule } from './super_agent_profile/super_agent_profile.module';
import { AgentProfileModule } from './agent_profile/agent_profile.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
    imports: [HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UsersModule,
    AdminProfileModule,
    SuperAgentProfileModule,
    AgentProfileModule,
    AuthModule,
    InvitationsModule,
  ],
})
export class AppModule {}
