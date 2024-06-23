import { Injectable } from '@nestjs/common';
import { InvitationsRepository } from 'src/entity/repositories/invitations.repo';
import { CreateInvitationDto } from './invitations.dto';

@Injectable()
export class InvitationsService {
    constructor(
        private readonly invitationRepo: InvitationsRepository
    ){}

    async createInvitation( invitersUsername: string) {
        return await this.invitationRepo.create({invitersUsername})
    }

    async findInvitationByUsername(invitersUsername: string) {
        return await this.invitationRepo.findOne({ invitersUsername });
    }

    async approveInvitation(invitationId: string, updateInvitation: CreateInvitationDto) {
        const updatedInvitation = {...updateInvitation, isApproved: true, status: 'Approved', isUsed: true};
        return await this.invitationRepo.findOneAndUpdate(
            {_id: invitationId},
            updatedInvitation,
        );
    }

    async markInvitationAsUsed(invitationId: string, updateInvitation: CreateInvitationDto) {
        const updatedInvitation = {...updateInvitation, isUsed: true, invitersUsername: null};
        return await this.invitationRepo.findOneAndUpdate(
            {_id: invitationId},
            updatedInvitation,
        );
    }
    
}
