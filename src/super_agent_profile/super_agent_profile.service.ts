import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { CreateSuperAgentProfileDto } from './super_agent_profile.dto';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class SuperAgentProfileService {
  constructor(
    private readonly superAgentRepo: SuperAgentProfileRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async findAll() {
    const superAgent = await this.superAgentRepo.find();
    if (!superAgent) {
      throw new NotFoundException('Agent not found');
    }
    return superAgent;
  }

  async findAgentByUsername(username: string) {
    const superAgent = await this.superAgentRepo.findOne({ username });
    console.log(`IN SUPER AGENT: ${superAgent}`);
    if (!superAgent) {
      throw new NotFoundException('SuperAgent not found');
    }
    return superAgent;
  }

  async updateSuperAgentProfile(e_mail: string, updateAgentDto: CreateSuperAgentProfileDto) {
    const { email, password, firstname, lastname, referal_username, role, ...otherFields } = updateAgentDto;
    const superAgentProfile = await this.superAgentRepo.findOne({email: e_mail})
    if (!superAgentProfile) {
      throw new NotFoundException('Super Agent profile not found');
    }

    if (email) {
      const existingUser = await this.superAgentRepo.findOne({ email });
      if (existingUser && existingUser._id.toString() !== superAgentProfile._id.toString()) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData = { ...otherFields };

    const updatedAgent = await this.superAgentRepo.findOneAndUpdate(
      { _id: superAgentProfile._id, role: 'SuperAgent' },
      { $set: updateData },
    );

    if (!updatedAgent) {
      throw new NotFoundException('Super Agent not found');
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
      message: 'Super Agent profile updated successfully',
      user: updatedAgent,
    };
  }
}