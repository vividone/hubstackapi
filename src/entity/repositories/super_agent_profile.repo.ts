import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories'; 
import { SuperAgentDocument, SuperAgent } from '../schema/super_agent_profile.schema';


@Global()
@Injectable()
export class SuperAgentRepository extends EntityRepository <SuperAgentDocument> {
    constructor(@InjectModel(SuperAgent.name) SuperAgentModel: Model<SuperAgentDocument>) {
        super(SuperAgentModel);
    } 
}
