import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class AdminProfileService {
    constructor(
        private readonly userRepo: UserRepository,
    ){}

    async countUsers(){
        try {
            const userCount = await this.userRepo.countDocument();
            return {userCount};
        } catch (error) {
            throw new InternalServerErrorException('Could not count users');
        }
    }

    async countUsersByRole(){
        try {
            const individualCount = await this.userRepo.countDocument({ role: 'Individual'});
            const agentCount = await this.userRepo.countDocument({ role: 'Agent'});
            return {
                individualCount,
                agentCount,
            };
        } catch (error) {
            throw new InternalServerErrorException('Could not count users');
        }
    }
}
