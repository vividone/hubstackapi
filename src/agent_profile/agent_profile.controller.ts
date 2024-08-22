import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AgentService } from './agent_profile.service';
import { CreateAgentProfileDto } from './dto/agent_profile.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CustomRequest } from 'src/configs/custom_request';

@ApiTags('Agent')
@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Agent')
  @Put('update-profile')
  async updateAgentProfile(
    @Body() updateAgentDto: CreateAgentProfileDto,
    @Req() request: CustomRequest,
  ) {
    const email = request.user.email;
    return await this.agentService.updateAgentProfile(email, updateAgentDto);
  }
}
