import { forwardRef, Module } from '@nestjs/common';
import { AgentController } from './agent_profile.controller';
import { AgentService } from './agent_profile.service';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { MongooseModule } from '@nestjs/mongoose';
import { Agent, AgentSchema } from 'src/entity';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentProfileRepository, JwtService],
  imports: [
    MongooseModule.forFeature([{ name: Agent.name, schema: AgentSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    UsersModule,
  ],
  exports: [AgentService, AgentProfileRepository],
})
export class AgentProfileModule {}
