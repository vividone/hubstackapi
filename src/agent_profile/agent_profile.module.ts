import { Module } from '@nestjs/common';
import { AgentController } from './agent_profile.controller';
import { AgentService } from './agent_profile.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService]
})
export class AgentModule {}
