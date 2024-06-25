import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Status } from 'src/enum';

export type InvitationsDocument = HydratedDocument<Invitations>;

export
@Schema({ timestamps: true })
class Invitations {
  @Prop({ required: true })
  invitersUsername: string;

  @Prop({ default: Status.PENDING })
  status: Status;

  @Prop({ type: Date })
  invitedAt: Date;

  @Prop({ type: Date })
  approvedAt: Date;

  @Prop({ default: false })
  isUsed: boolean;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitations);
