import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { OtpService } from '../mailing/otp.mail';
import { JwtPayload } from './jwt-payload';
import * as bcrypt from 'bcryptjs';
import { LoginUser } from 'src/users/users.entity';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { CreateUserDto } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import { ResetPasswordService } from '../mailing/resetPassword.mail';
import { WalletService } from 'src/wallet/wallet.service';
import { ReferralService } from 'src/referals/referral.service';
import { MockWalletService } from 'src/mock-wallet/mock-wallet.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UsersService,
    private readonly agentRepo: AgentProfileRepository,
    private readonly walletService: WalletService,
    private readonly mockWalletService: MockWalletService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly resetPasswordService: ResetPasswordService,
    private readonly referralService: ReferralService,
  ) {}

  async createUser(
    createUserDto: CreateUserDto | CreateAgentProfileDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: any,
  ) {
    const { email, role, referralCode } = createUserDto;
    const existingUser = await this.userRepo.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    createUserDto.referralCode = `${this.generateReferalCode()}-${createUserDto.firstname}`;

    if (referralCode) {
      await this.referralService.processReferral(referralCode);
    }

    let user: any;
    if (role === 'Agent') {
      user = await this.createAgent(createUserDto as CreateAgentProfileDto);
    } else {
      user = await this.userRepo.create(createUserDto);
    }

    const otp = this.otpService.generateOTP();
    await this.otpService.sendOtpEmail(
      email,
      otp,
      createUserDto.firstname,
      createUserDto.lastname,
    );
    await this.userService.saveOtpToUser(email, otp);

    return user;
  }

  private async createAgent(createAgentDto: CreateAgentProfileDto) {
    const agentUser = await this.userRepo.create(createAgentDto);
    const agentProfile = await this.agentRepo.create({
      ...createAgentDto,
      user: agentUser._id,
    });

    return { agentUser, agentProfile };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();

      console.log('Validated User:', result);
      return result;
    }
    return null;
  }

  async verifyOtp(otp: string) {
    const user = await this.userRepo.findOne({ otp });
    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = null;
    return await user.save();
  }

  async generateToken(user: any) {
    const payload: JwtPayload = {
      email: user.email,
      password: user.password,
      id: user._id,
      roles: [user.role],
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  generateRefreshToken(userId: string) {
    const payload = { id: userId };
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { refresh_token };
  }

  async loginUser(loginUserDto: LoginUser, res: any) {
    const { email, password } = loginUserDto;

    const user = await this.userRepo.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const refreshToken = this.generateRefreshToken(user._id);
    await this.userService.updateRefreshToken(
      user._id,
      refreshToken.refresh_token,
    );

    this.setRefreshTokenCookie(res, refreshToken.refresh_token);

    let hasWallet = false;
    const balance = null;

    try {
      const wallet = await this.mockWalletService.getUserWallet(user._id);
      hasWallet = !!wallet;

      // if (hasWallet) {
      //   balance = await this.mockWalletService.getSubaccountBalanceOnLogin(
      //     user._id,
      //   );
      // }
    } catch (error) {
      console.error('Error fetching wallet or balance:', error.message);
    }

    const userData = await this.userRepo.findOne(user._id, { password: false });
    const token = await this.generateToken(userData);

    return {
      status: 'Success',
      message: 'Login successful',
      data: userData,
      hasWallet,
      balance,
      token,
    };
  }

  private setRefreshTokenCookie(res: any, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
    });
  }

  async forgotPasswordToken(email: string) {
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email does not exist');
    }

    const payload = { email: user.email, userId: user._id };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '10m' });

    const resetPasswordUrl = `${process.env.APP_DOMAIN}/auth/reset-password/?token=${resetToken}`;
    console.log(resetPasswordUrl);

    await this.resetPasswordService.sendResetPasswordEmail(
      email,
      resetPasswordUrl,
    );

    return {
      status: 'Success',
      message: 'Password reset token sent to email',
    };
  }

  async resetForgottenPassword(password: string, token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.userRepo.findOne({ _id: decoded.id });
      if (!user) {
        throw new BadRequestException('Token is invalid or has expired');
      }

      user.password = await bcrypt.hash(password, 10);
      await user.save();

      return {
        status: 'Success',
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      console.error('Error during password reset:', error);
      throw new BadRequestException('Token is invalid or has expired');
    }
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    return this.userService.updatePassword(userId, oldPassword, newPassword);
  }

  private generateReferalCode() {
    const length = 10;
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const generatedCode = Math.floor(Math.random() * characters.length);
      result += characters[generatedCode];
    }

    return result;
  }
}
