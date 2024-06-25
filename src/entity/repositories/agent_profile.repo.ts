import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Agent, AgentDocument } from '../schema/agent_profile.schema';

@Global()
@Injectable()
export class AgentProfileRepository extends EntityRepository<AgentDocument> {
  constructor(@InjectModel(Agent.name) AgentModel: Model<AgentDocument>) {
    super(AgentModel);
  }
}
