import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SuperAgentProfileService } from './super_agent_profile.service';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { CreateSuperAgentProfileDto } from './super_agent_profile.dto';
import { CustomRequest } from 'src/configs/custom_request';

@Controller('super-agent-profile')
export class SuperAgentProfileController {
  constructor(private readonly superAgentService: SuperAgentProfileService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin', 'SuperAgent')
  @Get('all-agents')
  async findAllAgents() {
    return this.superAgentService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('SuperAgent')
  @Put('update-profile')
  async updateAgentProfile(
    @Body() updateSuperAgentDto: CreateSuperAgentProfileDto,
    @Req() request: CustomRequest,
  ) {
    const email = request.user.email;
    return await this.superAgentService.updateSuperAgentProfile(
      email,
      updateSuperAgentDto,
    );
  }
}
