import { Module } from '@nestjs/common';
import { SuperAgentProfileController } from './super_agent_profile.controller';
import { SuperAgentProfileService } from './super_agent_profile.service';

@Module({
  controllers: [SuperAgentProfileController],
  providers: [SuperAgentProfileService]
})
export class SuperAgentProfileModule {}
