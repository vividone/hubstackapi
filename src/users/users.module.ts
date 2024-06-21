import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users, UserSchema } from 'src/entity';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SuperAgentProfileModule } from 'src/super_agent_profile/super_agent_profile.module';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema}]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SuperAgentProfileModule,
    AgentProfileModule,
  ],
  exports: [ UsersService, UserRepository ]
})
export class UsersModule {}
