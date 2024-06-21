import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from './jwt-payload';
import { LoginUser } from 'src/users/users.entity';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';
import { CreateUserDto } from 'src/users/users.dto';

@Injectable()
export class AuthService{
    constructor(
        private readonly userRepo : UserRepository,
        private readonly agentRepo: AgentProfileRepository,
        private readonly jwtService : JwtService,

    ){}

    async createUser(createUserDto: CreateUserDto | CreateAgentProfileDto, req: any) {
        const { email, role } = createUserDto;
        const existingUser = await this.userRepo.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('Email already exists');
        }

        if (role === 'Agent') {
            return await this.createAgent(createUserDto as CreateAgentProfileDto);
        } else {
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

    async validateUser ( email: string, password: string) {
        const user = await this.userRepo.findOne({ email })
        if (user && await user.comparePassword(password)) {
            const { password, ...result } = user.toObject();
            return result;
            }
        return null;
    }

    async generateToken(user: any) {
        const payload: JwtPayload = { email: user.email, userId: user._id, password: user.password };
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

}
