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
import { ReferralService } from 'src/referrals/referral.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly userService: UsersService,
    private readonly agentRepo: AgentProfileRepository,
    private readonly walletService: WalletService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly referralService: ReferralService,
  ) { }

  async createUser(
    createUserDto: CreateUserDto | CreateAgentProfileDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    req: any,
  ) {
    let { email, role, referralCode } = createUserDto;
    email = email.toLowerCase();
    const existingUser = await this.userRepo.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    createUserDto.referralCode = `${this.generateReferralCode()}-${createUserDto.firstname}`;

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

      // console.log('Validated User:', result);
      return result;
    }
    return null;
  }

  public async verifyOtp(otp: string) {
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
    let { email, password } = loginUserDto;
    email = email.toLowerCase();
    const user = await this.userRepo.findOne({ email });
  
    if (!user || !(await user.comparePassword(password))) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!user.isVerified) {
      await this.resendOtp(email);
    }
  
    const refreshToken = this.generateRefreshToken(user._id);
    await this.userService.updateRefreshToken(
      user._id,
      refreshToken.refresh_token,
    );
  
    let hasWallet = false;
    let balance = 0;
  
    try {
      const wallet = await this.walletService.getUserWallet(user._id);
      hasWallet = !!wallet;
  
      if (hasWallet) {
        balance = await this.walletService.getUserWalletBalance(user._id);
      }
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
  

  // private setRefreshTokenCookie(res: any, token: string) {
  //   res.cookie('refreshToken', token, {
  //     httpOnly: true,
  //     maxAge: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
  //   });
  // }

  async forgotPasswordToken(email: string) {
    email = email.toLowerCase();
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email does not exist');
    }
    const otp = this.otpService.generateOTP();
    console.log(otp)
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();
    await this.otpService.sendOtpEmail(email, otp);
    return {
      status: 'Success',
      message: 'Password reset OTP sent to email',
    };
  }

  async verifyPasswordResetOtp(otp: string) {
    const user = await this.userRepo.findOne({ otp });
    if (!user) {
      throw new BadRequestException('Invalid OTP');
    }
  
    if (user.otpExpiry && new Date() > user.otpExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    user.otp = null;
    user.otpExpiry = null;
    user.isOtpVerified = true;
    await user.save();
    const token = this.jwtService.sign({ userId: user._id });
  
    return { token, message: 'OTP verified successfully' };
  }
  


  async resetForgottenPassword(password: string, token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const userId = String(decoded.userId)

      const user = await this.userRepo.findOne({_id: userId});
  
      if (!user || !user.isOtpVerified) {
        throw new BadRequestException('User not found or OTP not verified');
      }
      user.password = await bcrypt.hash(password, 10);
      user.isOtpVerified = false;

      await user.save();
  
      return {
        status: 'Success',
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'An error occurred while resetting the password'
      );
    }
  }
  
  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findOne({ _id: userId });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    if (await bcrypt.compare(newPassword, user.password)) {
      throw new BadRequestException('New password cannot be the same as the old password');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return {
      status: 'Success',
      message: 'Password has been updated successfully',
    };
  }

  async resendOtp(email: string) {
    const user = await this.userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('Email does not exist');
    }
  
    let otp: string;
    let isUniqueOtp = false;
    while (!isUniqueOtp) {
      otp = this.otpService.generateOTP();
      const checkOtp = await this.userRepo.findOne({ otp });
  
      if (!checkOtp) {
        isUniqueOtp = true;
      }
    }
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await this.otpService.sendOtpEmail(email, otp);
  
    return {
      status: 'Success',
      message: 'A new OTP has been sent to your email',
    };
  }
  



  private generateReferralCode() {
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
