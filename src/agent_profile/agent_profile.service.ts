import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgentProfileRepository } from 'src/entity/repositories/agent_profile.repo';
import { CreateAgentProfileDto } from './agent_profile.dto';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class AgentService {
  constructor(
    private readonly agentRepo: AgentProfileRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async updateAgentProfile(id: string, updateAgentDto: CreateAgentProfileDto) {
    const { email, password, firstname, lastname, ...otherFields } =
      updateAgentDto;

    if (email) {
      const existingUser = await this.agentRepo.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedAgent = await this.agentRepo.findOneAndUpdate(
      { _id: id, role: 'Agent' },
      { $set: otherFields },
    );

    if (!updatedAgent) {
      throw new NotFoundException('Agent not found');
    }

    const user = await this.userRepo.findOne({ email: updatedAgent.email });

    if (user) {
      Object.assign(user, {
        phoneNumber: updatedAgent.phoneNumber,
        username: updatedAgent.username,
      });
      await user.save();
    } else {
      throw new NotFoundException('Linked User not found');
    }

    return {
      status: 'Success',
      message: 'Agent profile updated successfully',
      user: updatedAgent,
    };
  }
}
