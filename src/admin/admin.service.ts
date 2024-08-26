import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';

@Injectable()
export class AdminProfileService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly transactionRepo: TransactionRepository,
        private readonly walletRepo: WalletRepository,
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

    async getWalletSummary(){
        try {
            const individualSummary = await this.walletRepo.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        let: { walletUserId: { $toObjectId: '$user' } },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $eq: ['$_id', '$$walletUserId'],
                              },
                            },
                          },
                        ],
                        as: 'user',
                      },
                    },
                { $unwind: '$user' },
                { $match: { 'user.role': 'Individual' } },
                {
                  $group: {
                    _id: null,
                    totalBalance: { $sum: `$balance` },
                    numberOfUsers: { $sum: 1 },
                    averageBalance: { $avg: '$balance' },
                    minBalance: { $min: '$balance' },
                    maxBalance: { $max: '$balance' },
                  },
                },
                {
                    $project: {
                      _id: 0,
                      totalBalance: 1,
                      numberOfUsers: 1,
                      averageBalance: 1,
                      minBalance: 1,
                      maxBalance: 1,
                    },
                  },
              ]);
              const agentSummary = await this.walletRepo.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        let: { walletUserId: { $toObjectId: '$user' } },
                        pipeline: [
                          {
                            $match: {
                              $expr: {
                                $eq: ['$_id', '$$walletUserId'],
                              },
                            },
                          },
                        ],
                        as: 'user',
                      },
                    },
                { $unwind: '$user' },
                { $match: { 'user.role': 'Agent' } },
                {
                  $group: {
                    _id: null,
                    totalBalance: { $sum: `$balance` },
                    numberOfUsers: { $sum: 1 },
                    averageBalance: { $avg: '$balance' },
                    minBalance: { $min: '$balance' },
                    maxBalance: { $max: '$balance' },
                  },
                },
                {
                    $project: {
                      _id: 0,
                      totalBalance: 1,
                      numberOfUsers: 1,
                      averageBalance: 1,
                      minBalance: 1,
                      maxBalance: 1,
                    },
                  },
              ]);
              const totalBalance = await this.walletRepo.aggregate([
                {
                  $group: {
                    _id: null,
                    totalBalance: { $sum: '$balance' },
                    numberOfUsers: { $sum: 1 },
                    averageBalance: { $avg: '$balance' },
                    minBalance: { $min: '$balance' },
                    maxBalance: { $max: '$balance' },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    totalBalance: 1,
                    numberOfUsers: 1,
                    averageBalance: 1,
                    minBalance: 1,
                    maxBalance: 1,
                  },
                },
              ]);
              return {
                individuals: individualSummary[0] || this.emptySummary(),
                agents: agentSummary[0] || this.emptySummary(),
                overall: totalBalance[0] || this.emptySummary(),
            }
            
        } catch (error) {
            console.log(error)
            throw new Error('Could not fetch wallet summary');
        }
    }

    private emptySummary() {
        return {
          totalBalance: 0,
          numberOfUsers: 0,
          averageBalance: 0,
          minBalance: 0,
          maxBalance: 0,
        };
    }
}
