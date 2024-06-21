import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';

export type AgentDocument = HydratedDocument<Agent>;

export
@Schema({ timestamps : true })
class Agent extends Users {
    
    @Prop()
    business_username: string;

    @Prop()
    region: string;

    @Prop()
    location: string;

    @Prop()
    is_verified: boolean;

    @Prop()
    super_agent_username: string;

}

export const AgentSchema = SchemaFactory.createForClass(Agent)