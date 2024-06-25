import { Injectable, NotFoundException } from '@nestjs/common';
import { SuperAgentProfileRepository } from 'src/entity/repositories/super_agent_profile.repo';

@Injectable()
export class SuperAgentProfileService {
  constructor(private readonly superAgentRepo: SuperAgentProfileRepository) {}

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
}
