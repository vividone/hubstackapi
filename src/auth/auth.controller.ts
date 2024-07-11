import {
  Body,
  Post,
  Res,
  Req,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { LoginUser } from 'src/users/users.entity';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { InvitationsService } from 'src/invitations/invitations.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly invitationService: InvitationsService,
  ) {}

  @Post('register-individual')
  registerUser(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    if (!createUserDto.role) {
      throw new BadRequestException('Role is required');
    }
    return this.authService.createUser(createUserDto, req);
  }

  @Post('agent-referal-registration')
  async registerAgentByInvitation(
    @Body() createAgentDto: CreateAgentProfileDto,
    @Req() req: any,
  ) {
    const { referal_username } = createAgentDto;

    const invitation =
      await this.invitationService.findInvitationByUsername(referal_username);
    console.log(invitation._id);
    if (!invitation || invitation.isUsed) {
      throw new NotFoundException('Invalid invitation.');
    }

    createAgentDto.role = 'Agent';

    const createdAgent = await this.authService.createUser(createAgentDto, req);
    await this.invitationService.markInvitationAsUsed(
      invitation._id,
      invitation,
    );

    return { message: 'Agent registered successfully.', Agent: createdAgent };
  }

  // @Post('super-agent-referal-registration')
  // async registerSuperAgentByInvitation(@Body() createSuperAgentDto: CreateSuperAgentProfileDto, @Req() req: any) {
  //     const { referal_username } = createSuperAgentDto;

  //     const invitation = await this.invitationService.findInvitationByUsername(referal_username);
  //     if (!invitation || invitation.isUsed) {
  //         throw new NotFoundException('Invalid invitation.');
  //     }

  //     createSuperAgentDto.role = 'SuperAgent'

  //     const createdSuperAgent = await this.authService.createUser(createSuperAgentDto, req);
  //     await this.invitationService.markInvitationAsUsed(invitation._id, invitation);

  //     return { message: 'SuperAgent registered successfully.', superAgent: createdSuperAgent };
  // }

  @Post('register-agent')
  registerAgent(
    @Body() createAgentDto: CreateAgentProfileDto,
    @Req() req: Request,
  ) {
    if (createAgentDto.role !== 'Agent') {
      throw new BadRequestException(
        'Role must be agent for agent registration',
      );
    }
    return this.authService.createUser(createAgentDto, req);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtp: any) {
    return this.authService.verifyOtp(verifyOtp.otp);
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUser, @Res() res: any) {
    try {
      const result = await this.authService.loginUser(loginUserDto, res);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Error during login:', error);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'Failure',
          error: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 'Failure',
        error: 'Internal Server Error',
      });
    }
  }

  @Post('forgot-password')
  async forgotPasswordToken(@Body('email') email: string) {
    try {
      const result = await this.authService.forgotPasswordToken(email);
      return { status: 'Success', ...result };
    } catch (error) {
      console.error('Error during forgot password token generation:', error);

      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Internal Server Error');
    }
  }

  @Post('reset-password/:token')
  async resetForgottenPassword(
    @Body('password') password: string,
    @Param('token') token: string,
  ) {
    try {
      const result = await this.authService.resetForgottenPassword(
        password,
        token,
      );
      return { status: 'Success', ...result };
    } catch (error) {
      console.error('Error during password reset:', error);

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Internal Server Error');
    }
  }
}
