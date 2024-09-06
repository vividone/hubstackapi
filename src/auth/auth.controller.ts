import {
  Body,
  Post,
  Res,
  Req,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateAgentProfileDto } from 'src/agent_profile/dto/agent_profile.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, LoginDtoResponse } from './dto/login.dto';
import { CustomRequest } from 'src/configs/custom_request';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { ApiKeyGuard } from './apikey.guard';
import { ForgotPasswordDto, ResetPasswordDto, UpdatePasswordDto } from './dto/reset.password.dto';
import { ResendOtp, VerifyEmail, VerifyOtp } from './dto/otp.dto';
import { CreateAdminProfileDto } from 'src/admin/dto/admin.dto';

@ApiTags('Authentication Operations')
@Controller('auth')
@UseGuards(ApiKeyGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register-individual')
  registerUser(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    if (!createUserDto.role) {
      throw new BadRequestException('Role is required');
    }
    return this.authService.createUser(createUserDto, req);
  }


  @ApiCreatedResponse({
    type: LoginDtoResponse,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'one time use: Create and log in admin' })
  @Post('admin-login')
  async createAndLoginAdmin(
    @Body() createAdminDto: CreateAdminProfileDto,
  ) {
    try {
      const result = await this.authService.createAndLoginAdmin(createAdminDto);
      return {
        status: 'Success',
        message: 'Admin created and login successful',
        data: result.data,
        token: result.token,
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Error logging in Admin');
    }
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
    @Req() req: Request,
  ) {
    if (createAgentDto.role !== 'Agent') {
      throw new BadRequestException(
        'Role must be agent for agent registration',
      );
    }
    return this.authService.createUser(createAgentDto, req);
  }
  @ApiCreatedResponse({
    description: 'expected response',
  })
  @ApiOperation({ summary: 'verify email' })
  @Post('verify-email')
  async verifyOtp(@Body() verifyEmail: VerifyEmail) {
    return this.authService.verifyOtp(verifyEmail.otp);
  }

  @Post('verify-otp')
  async verifyResetPasswordOtp(@Body() verifyOtp: VerifyOtp) {
    return this.authService.verifyPasswordResetOtp(verifyOtp.otp);
  }

  @Post('resend-otp')
  async resendOtp(@Body() resendOtp: ResendOtp) {
    try {
      const result = await this.authService.resendOtp(resendOtp.email);
      return {
        status: 'Success',
        message: result.message,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Internal Server Error');
    }
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
  async forgotPasswordToken(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;
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
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('token') token: string,
  ) {
    try {
      const { password } = resetPasswordDto;
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
  @Roles('Agent', 'Individual')
  @Put('update-password')
  async updatePassword(
    @Req() request: CustomRequest,
    @Body() body:UpdatePasswordDto,
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
