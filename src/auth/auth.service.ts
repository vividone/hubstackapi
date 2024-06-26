import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt-payload';
import { LoginUser } from 'src/users/users.entity';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { CreateUserDto } from 'src/users/users.dto';
import { CreateSuperAgentProfileDto } from 'src/super_agent_profile/super_agent_profile.dto';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { OtpService } from 'src/helpers/otp.mail';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly agentRepo: AgentProfileRepository,
        private readonly superAgentRepo: SuperAgentProfileRepository,
        private readonly jwtService: JwtService,
        private readonly otpService: OtpService
    ) { }

    async createUser(
        createUserDto:
            | CreateUserDto
            | CreateAgentProfileDto
            | CreateSuperAgentProfileDto,
        req: any,
    ) {
        const { email, role } = createUserDto;
        const existingUser = await this.userRepo.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        if (role === 'Agent') {
            return await this.createAgent(createUserDto as CreateAgentProfileDto);
        } else if (role === 'SuperAgent') {
            return await this.createSuperAgent(
                createUserDto as CreateSuperAgentProfileDto,
            );
        }
        const otp = this.otpService.generateOTP();
        await this.otpService.sendOtpEmail(email, createUserDto.first_name, createUserDto.last_name, otp);
        {
            return await this.userRepo.create(createUserDto);
        }
    }

    private async createAgent(createAgentDto: CreateAgentProfileDto) {
        const agentUser = await this.userRepo.create(createAgentDto);
        const agentProfile = await this.agentRepo.create({
            ...createAgentDto,
            user: agentUser._id,
        });

        return { agentUser, agentProfile };
    }

    private async createSuperAgent(
        createSuperAgentDto: CreateSuperAgentProfileDto,
    ) {
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
            userId: user._id,
            password: user.password,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async loginUser(loginUser: LoginUser) {
        const { email, password } = loginUser;

        const user = await this.userRepo.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new BadRequestException('Invalid credentials');
        }
        return this.generateToken(user);
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
