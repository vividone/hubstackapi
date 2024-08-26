import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';

@Injectable()
export class AdminProfileService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly transactionRepo: TransactionRepository,
    ){}

    async countUsers(){
        try {
            const userCount = await this.userRepo.countDocument();
            return {userCount};
        } catch (error) {
            throw new InternalServerErrorException('Could not count users');
        }
    }

    async countTransactions(){
        try {
            const transactionCount = await this.transactionRepo.countDocument();
            return {transactionCount};
        } catch (error) {
            throw new InternalServerErrorException('Could not count Transactions');
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

    async countTransactionsByStatus(){
        try {
            const pendingTransaction = await this.transactionRepo.countDocument({ transactionStatus: 'pending'});
            const completedTransaction = await this.transactionRepo.countDocument({ transactionStatus: 'successful'});
            const failedTransaction = await this.transactionRepo.countDocument({ transactionStatus: 'failed'});
            return {
                pendingTransaction,
                completedTransaction,
                failedTransaction,
            };
        } catch (error) {
            throw new InternalServerErrorException('Could not retrive transactions');
        }
    }
}
