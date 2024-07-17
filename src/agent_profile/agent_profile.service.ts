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


  async updateAgentProfile(e_mail: string, updateAgentDto: CreateAgentProfileDto) {
    const { email, password, firstname, lastname, referal_username, role, ...otherFields } = updateAgentDto;
    const agentProfile = await this.agentRepo.findOne({email: e_mail})
    if (!agentProfile) {
      throw new NotFoundException('Agent profile not found');
    }

    if (email) {
      const existingUser = await this.agentRepo.findOne({ email });
      if (existingUser && existingUser._id.toString() !== agentProfile._id.toString()) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData = { ...otherFields };

    const updatedAgent = await this.agentRepo.findOneAndUpdate(
      { _id: agentProfile._id, role: 'Agent' },
      { $set: updateData },
    );

    if (!updatedAgent) {
      throw new NotFoundException('Agent not found');
    }
    
    const user = await this.userRepo.findOne({ email: e_mail });
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
