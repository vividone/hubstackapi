import {
  Controller,
  Post,
  Body,
  NotFoundException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { SuperAgentProfileService } from '../super_agent_profile/super_agent_profile.service'; // Adjusted import path
import { CreateInvitationDto } from './invitations.dto';

@Controller('invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
    private readonly superAgentService: SuperAgentProfileService,
  ) {}
  @Post('send-invite')
  createInvitation(
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: Request,
  ) {
    const { invitersUsername } = createInvitationDto;

    const superAgent =
      this.superAgentService.findAgentByUsername(invitersUsername);
    if (!superAgent) {
      throw new NotFoundException('SuperAgent not found.');
    }

    const invitation =
      this.invitationsService.createInvitation(invitersUsername);

    // TODO: Implement mail sending functionality here

    return { message: 'Invitation created successfully.', invitation };
  }
}
