import {
  Body,
  Post,
  Res,
  Req,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Query,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginDtoResponse } from './dto/login.dto';
import { CustomRequest } from 'src/configs/custom_request';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';

@ApiTags('Authentication Operations')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-individual')
  registerUser(
    @Body() createUserDto: CreateUserDto,
    @Query('referralCode') referralCode: string,
  ) {
    if (!createUserDto.role) {
      throw new BadRequestException('Role is required');
    }
    return this.authService.createUser(createUserDto, referralCode);
  }

  // @Post('agent-referral-registration')
  // async registerAgentByInvitation(
  //   @Body() createAgentDto: CreateAgentProfileDto,
  //   @Req() req: any,
  // ) {
  //   const { referal_username } = createAgentDto;

  //   const invitation =
  //     await this.invitationService.findInvitationByUsername(referal_username);
  //   console.log(invitation._id);
  //   if (!invitation || invitation.isUsed) {
  //     throw new NotFoundException('Invalid invitation.');
  //   }

  //   createAgentDto.role = 'Agent';

  //   const createdAgent = await this.authService.createUser(createAgentDto, req);
  //   await this.invitationService.markInvitationAsUsed(
  //     invitation._id,
  //     invitation,
  //   );

  //   return { message: 'Agent registered successfully.', Agent: createdAgent };
  // }

  @Post('register-agent')
  registerAgent(
    @Body() createAgentDto: CreateAgentProfileDto,
    @Query('referralCode') referralCode: string,
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

  @ApiCreatedResponse({
    type: LoginDtoResponse,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Login to your account' })
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginDto, @Res() res: any) {
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

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('SuperAgent', 'Agent', 'Individual')
  @Put('update-password')
  async updatePassword(
    @Req() request: CustomRequest,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const { oldPassword, newPassword } = body;
    const userId = request.user.id;

    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Both old and new passwords are required');
    }

    const updatedUser = await this.authService.updatePassword(
      userId,
      oldPassword,
      newPassword,
    );
    return {
      status: 'Success',
      message: 'Password updated successfully',
      user: updatedUser,
    };
  }
}
