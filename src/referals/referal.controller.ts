import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './referal.service';
import { CreateInvitationDto } from './referal.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Super Agent Operations')
@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  // @UseGuards(JwtAuthGuard, RolesAuth)
  // @Roles('Admin', 'SuperAgent')
  // @Post('send-invite')
  // createInvitation(@Body() createInvitationDto: CreateInvitationDto) {
  //   const { invitersUsername } = createInvitationDto;

  //   const superAgent =
  //     this.superAgentService.findAgentByUsername(invitersUsername);
  //   if (!superAgent) {
  //     throw new NotFoundException('SuperAgent not found.');
  //   }

  //   const invitation =
  //     this.invitationsService.createInvitation(invitersUsername);
  //   return { message: 'Invitation created successfully.', invitation };
  // }
}