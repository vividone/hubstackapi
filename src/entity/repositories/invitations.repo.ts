import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Invitations, InvitationsDocument } from '../schema/invitation.schema';

@Global()
@Injectable()
export class InvitationsRepository extends EntityRepository<InvitationsDocument> {
  constructor(
    @InjectModel(Invitations.name) InvitationModel: Model<InvitationsDocument>,
  ) {
    super(InvitationModel);
  }
}
