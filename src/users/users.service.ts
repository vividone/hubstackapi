import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { CreateUserDto } from './users.dto';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly agentRepo: AgentProfileRepository
    ) { }

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

    async findOne(id: string) {
        const user = await this.userRepo.findOne({ _id: id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

}
