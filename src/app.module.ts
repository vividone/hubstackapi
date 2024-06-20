import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AdminProfileModule } from './admin_profile/admin_profile.module';
import { SuperAgentProfileModule } from './super_agent_profile/super_agent_profile.module';
import { AgentModule } from './agent_profile/agent_profile.module';

@Module({
    imports: [HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UsersModule,
    AdminProfileModule,
    SuperAgentProfileModule,
    AgentModule,
  ],
})
export class AppModule {}
