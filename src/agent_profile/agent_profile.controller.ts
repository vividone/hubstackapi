import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AgentService } from './agent_profile.service';
import { CreateAgentProfileDto } from './agent_profile.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';

@Controller('agent')
export class AgentController {
    constructor(
        private readonly agentService: AgentService
    ) { }

    @UseGuards(JwtAuthGuard, RolesAuth)
    @Roles('Agent')
    @Put('update-profile/:id')
    async updateAgentProfile(@Param('id') id: string, @Body() updateAgentDto: CreateAgentProfileDto) {
        return await this.agentService.updateAgentProfile(id, updateAgentDto);
    }
}