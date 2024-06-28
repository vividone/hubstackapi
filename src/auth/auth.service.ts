import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { OtpService } from './otp.mail';
import { JwtPayload } from './jwt-payload';
import { LoginUser } from 'src/users/users.entity'; 
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateSuperAgentProfileDto } from 'src/super_agent_profile/super_agent_profile.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly userService: UsersService,
        private readonly agentRepo: AgentProfileRepository,
        private readonly superAgentRepo: SuperAgentProfileRepository,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService,
    ) {}

    async createUser(
        createUserDto: CreateUserDto | CreateAgentProfileDto | CreateSuperAgentProfileDto,
        req: any,
    ) {
        const { email, role } = createUserDto;
        const existingUser = await this.userRepo.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        let user;
        if (role === 'Agent') {
            user = await this.createAgent(createUserDto as CreateAgentProfileDto);
        } else if (role === 'SuperAgent') {
            user = await this.createSuperAgent(createUserDto as CreateSuperAgentProfileDto);
        } else {
            user = await this.userRepo.create(createUserDto);
        }

        const otp = this.otpService.generateOTP();
        await this.otpService.sendOtpEmail(email, otp, createUserDto.first_name, createUserDto.last_name);
        await this.otpService.saveOtpToUser(email, otp);

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

    private async createSuperAgent(createSuperAgentDto: CreateSuperAgentProfileDto) {
        const superAgentUser = await this.userRepo.create(createSuperAgentDto);
        const superAgentProfile = await this.superAgentRepo.create({
            ...createSuperAgentDto,
            user: superAgentUser._id,
        });

        return { superAgentUser, superAgentProfile };
    }

    async validateUser(email: string, password: string) {
        const user = await this.userRepo.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }

    async generateToken(user: any) {
        const payload: JwtPayload = {
            email: user.email,
            password: user.password,
            userId: user._id,
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
        await this.userService.updateRefreshToken(user._id, refreshToken.refresh_token);

        this.setRefreshTokenCookie(res, refreshToken.refresh_token);

        const userData = await this.userRepo.findOne(user._id, { password: false });
        //const token = await this.generateToken(userData);

        return {
            status: 'Success',
            message: 'Login successful',
            data: userData,
            refreshToken,
        };
    }

    private setRefreshTokenCookie(res: any, token: string) {
        res.cookie('refreshToken', token, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000, // 72 hours in milliseconds
        });
    }
}
