import { Injectable } from '@nestjs/common';
import { InvitationsRepository } from 'src/entity/repositories/invitations.repo';
import { CreateInvitationDto } from './referal.dto';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationRepo: InvitationsRepository,
    private readonly userRepo: UserRepository
  ) {}

  async findreferee(refCode: string) {
    return await this.userRepo.findOne({ refCode });
  }

  // async approveInvitation(
  //   invitationId: string,
  //   updateInvitation: CreateInvitationDto,
  // ) {
  //   const updatedInvitation = {
  //     ...updateInvitation,
  //     isApproved: true,
  //     status: 'Approved',
  //   };
  //   return await this.invitationRepo.findOneAndUpdate(
  //     { _id: invitationId },
  //     updatedInvitation,
  //   );
  // }

  // async markInvitationAsUsed(
  //   invitationId: string,
  //   updateInvitation: CreateInvitationDto,
  // ) {
  //   const updatedInvitation = {
  //     ...updateInvitation,
  //     isUsed: true,
  //     invitersUsername: null,
  //   };
  //   console.log(updatedInvitation);
  //   await this.invitationRepo.findOneAndUpdate(
  //     { _id: invitationId },
  //     updatedInvitation,
  //   );
  //   return await this.invitationRepo.findOne({ _id: invitationId });
  // }
}
