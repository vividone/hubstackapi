import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';

export type SuperAgentDocument = HydratedDocument<SuperAgent>;

export
@Schema()
class SuperAgent{
    @Prop()
    address: string;

    @Prop()
    business_username: string;

    @Prop()
    region: string;

    @Prop()
    location: string;

    @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
    users: Users | Types.ObjectId;

}

export const SuperAgentSchema = SchemaFactory.createForClass(SuperAgent)