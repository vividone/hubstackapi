import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { CreateUserDto } from './users.dto';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo'; 
import { CreateAgentProfileDto } from 'src/agent_profile/agent_profile.dto';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly agentRepo: AgentProfileRepository
    ){}

    async createUser( createUserDto: CreateUserDto, req: any) {
        const { email, password, ...rest } = createUserDto;

        const existingUser = await this.agentRepo.findOne({ email });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }

        return await this.userRepo.create({
            email,
            password,
            ...rest,
        })
    }

    async createAgent( createAgentDto: CreateAgentProfileDto , req: any) {
        const { email, password, ...rest } = createAgentDto;

        const existingUser = await this.userRepo.findOne({ email });
        if (existingUser) {
          throw new BadRequestException('Email already exists');
        }

        return await this.agentRepo.create({
            email,
            password,
            ...rest,
        })
    }

}
