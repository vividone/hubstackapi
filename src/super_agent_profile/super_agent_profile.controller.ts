import { Controller, Get, UseGuards } from '@nestjs/common';
import { SuperAgentProfileService } from './super_agent_profile.service';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';

@Controller('super-agent-profile')
export class SuperAgentProfileController {
  constructor(private readonly superAgentService: SuperAgentProfileService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin', 'SuperAgent')
  @Get('all-agents')
  async findAllAgents() {
    return this.superAgentService.findAll();
  }
}
