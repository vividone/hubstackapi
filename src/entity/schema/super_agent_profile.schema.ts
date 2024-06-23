import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from './user.schema';

export type SuperAgentDocument = HydratedDocument<SuperAgent>;

export
@Schema({ timestamps: true })
class SuperAgent extends Users{

    @Prop()
    business_username: string;

    @Prop()
    region: string;

    @Prop()
    location: string;

    @Prop()
    is_verified: boolean;

    @Prop()
    admin_username: string;

    @Prop({ type: Types.ObjectId, ref: Users.name, required: true })
    user: Users | Types.ObjectId; 
}

export const SuperAgentSchema = SchemaFactory.createForClass(SuperAgent)