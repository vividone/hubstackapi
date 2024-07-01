import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users, UserSchema } from 'src/entity';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { SuperAgentProfileModule } from 'src/super_agent_profile/super_agent_profile.module';
import { AgentProfileModule } from 'src/agent_profile/agent_profile.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UserSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    AgentProfileModule,
    JwtModule
  ],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
