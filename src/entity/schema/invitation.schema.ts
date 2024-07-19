import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { Status } from 'src/enum';

export type InvitationsDocument = HydratedDocument<Invitations>;

export
@Schema({ timestamps: true })
class Invitations {
  @ApiProperty()
  @Prop({ required: true })
  invitersUsername: string;

  @ApiProperty()
  @Prop({ default: Status.PENDING })
  status: Status;

  @ApiProperty()
  @Prop({ type: Date })
  invitedAt: Date;

  @ApiProperty()
  @Prop({ type: Date })
  approvedAt: Date;

  @ApiProperty()
  @Prop({ default: false })
  isUsed: boolean;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitations);
