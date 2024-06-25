import { Controller, Get } from '@nestjs/common';
import { SuperAgentProfileService } from './super_agent_profile.service';

@Controller('super-agent-profile')
export class SuperAgentProfileController {
  constructor(private readonly superAgentService: SuperAgentProfileService) {}

  @Get('all-agents')
  async findAllAgents() {
    return this.superAgentService.findAll();
  }
}
