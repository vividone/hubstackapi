import {
    Body,
    Get,
    Param,
    Post,
    Patch,
    Delete,
    Req,
    BadRequestException,
    NotFoundException,
  } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { LoginUser } from 'src/users/users.entity';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { CreateSuperAgentProfileDto } from 'src/super_agent_profile/super_agent_profile.dto';
import { InvitationsService } from 'src/invitations/invitations.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly invitationService: InvitationsService
    ){}

    @Post('Register')
    registerUser(@Body() createUserDto: CreateUserDto, @Req() req: Request){
        if(!createUserDto.role){
            throw new BadRequestException('Role is required');
        }
        return this.authService.createUser(createUserDto, req);
    }


    @Post('agent-referal-registration')
    async registerAgentByInvitation(@Body() createAgentDto: CreateAgentProfileDto, @Req() req: any) {
        const { referal_username } = createAgentDto;

        const invitation = await this.invitationService.findInvitationByUsername(referal_username);
        if (!invitation || invitation.isUsed) {
            throw new NotFoundException('Invalid invitation.');
        }

        createAgentDto.role = 'Agent'

        const createdAgent = await this.authService.createUser(createAgentDto, req);
        await this.invitationService.markInvitationAsUsed(invitation._id, invitation);

        return { message: 'Agent registered successfully.', Agent: createdAgent };
    }


    @Post('super-agent-referal-registration')
    async registerSuperAgentByInvitation(@Body() createSuperAgentDto: CreateSuperAgentProfileDto, @Req() req: any) {
        const { referal_username } = createSuperAgentDto;

        const invitation = await this.invitationService.findInvitationByUsername(referal_username);
        if (!invitation || invitation.isUsed) {
            throw new NotFoundException('Invalid invitation.');
        }
    
        createSuperAgentDto.role = 'SuperAgent'

        const createdSuperAgent = await this.authService.createUser(createSuperAgentDto, req);
        await this.invitationService.markInvitationAsUsed(invitation._id, invitation);

        return { message: 'SuperAgent registered successfully.', superAgent: createdSuperAgent };
    }

    @Post('Register-agent')
    registerAgent(@Body() createAgentDto: CreateAgentProfileDto, @Req() req: Request){
        if( createAgentDto.role !== 'Agent'){
            throw new BadRequestException('Role must be agent for agent registration')
        }
        return this.authService.createUser(createAgentDto, req);
    }

    // @Post('Register-superAgent')
    // registerSuperAgent(@Body() createSuperAgentDto: CreateSuperAgentProfileDto, @Req() req: Request){
    //     if( createSuperAgentDto.role !== 'SuperAgent'){
    //         throw new BadRequestException('Role must be SuperAgent for SuperAgent registration')
    //     }
    //     return this.authService.createUser(createSuperAgentDto, req);
    // }

    @Post('login')
    loginUser(@Body() loginUserDto: LoginUser,@Req() req: Request) {
        return this.authService.loginUser(loginUserDto);
    }
}
