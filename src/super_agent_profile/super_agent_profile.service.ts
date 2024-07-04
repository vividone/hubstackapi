import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';
import { CreateSuperAgentProfileDto } from './super_agent_profile.dto';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class SuperAgentProfileService {
  constructor(
    private readonly superAgentRepo: SuperAgentProfileRepository,
    private readonly userRepo: UserRepository
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

  async updateSuperAgentProfile(id: string, updateSuperAgentDto: CreateSuperAgentProfileDto) {
    const { email, password, ...otherFields } = updateSuperAgentDto;

    if (email) {
      const existingUser = await this.superAgentRepo.findOne({ email });
      if (existingUser && existingUser._id.toString() !== id) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedAgent = await this.superAgentRepo.findOneAndUpdate(
      { _id: id, role: 'SuperAgent' },
      { $set: otherFields },
    )

    if (!updatedAgent) {
      throw new NotFoundException('SuperAgent not found');
    }

    const user = await this.userRepo.findOne({ email: updatedAgent.email });

    if (user) {
      Object.assign(user, {
        firstname: updatedAgent.firstname,
        lastName: updatedAgent.lastName,
        phoneNumber: updatedAgent.phoneNumber,
        username: updatedAgent.username,
      });
      await user.save();
    } else {
      throw new NotFoundException('Linked User not found');
    }

    return {
      status: 'Success',
      message: 'SuperAgent profile updated successfully',
      user: updatedAgent,
    };
  }

}
