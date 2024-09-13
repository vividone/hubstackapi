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
  ) {}

  async countUsers() {
    try {
      const userCount = await this.userRepo.countDocument();
      return { userCount };
    } catch (error) {
      throw new InternalServerErrorException('Could not count users');
    }
  }

  async countTransactions() {
    try {
      const transactionCount = await this.transactionRepo.countDocument();
      return { transactionCount };
    } catch (error) {
      throw new InternalServerErrorException('Could not count Transactions');
    }
  }

  async countUsersByRole() {
    try {
      const individualCount = await this.userRepo.countDocument({
        role: 'Individual',
      });
      const agentCount = await this.userRepo.countDocument({ role: 'Agent' });
      const adminCount = await this.userRepo.countDocument({ role: 'Admin' });
      return {
        individualCount,
        agentCount,
        adminCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Could not count users');
    }
  }

  async countTransactionsByStatus() {
    try {
      const pendingTransaction = await this.transactionRepo.countDocument({
        transactionStatus: 'pending',
      });
      const completedTransaction = await this.transactionRepo.countDocument({
        transactionStatus: 'successful',
      });
      const failedTransaction = await this.transactionRepo.countDocument({
        transactionStatus: 'failed',
      });
      return {
        pendingTransaction,
        completedTransaction,
        failedTransaction,
      };
    } catch (error) {
      throw new InternalServerErrorException('Could not retrive transactions');
    }
  }

  async getWalletSummary() {
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
            numberOfUsersWithWallets: { $sum: 1 },
            averageBalance: { $avg: '$balance' },
            minBalance: { $min: '$balance' },
            maxBalance: { $max: '$balance' },
          },
        },
        {
          $project: {
            _id: 0,
            totalBalance: 1,
            numberOfUsersWithWallets: 1,
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
            numberOfAentsWithWallets: { $sum: 1 },
            averageBalance: { $avg: '$balance' },
            minBalance: { $min: '$balance' },
            maxBalance: { $max: '$balance' },
          },
        },
        {
          $project: {
            _id: 0,
            totalBalance: 1,
            numberOfAgentsWithWallets: 1,
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
            overallUsersWithWallets: { $sum: 1 },
            averageBalance: { $avg: '$balance' },
            minBalance: { $min: '$balance' },
            maxBalance: { $max: '$balance' },
          },
        },
        {
          $project: {
            _id: 0,
            totalBalance: 1,
            overallUsersWithWallets: 1,
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
      };
    } catch (error) {
      console.log(error);
      throw new Error('Could not fetch wallet summary');
    }
  }

  async getTopServices() {
    try {
      return await this.transactionRepo.aggregate([
        {
          $group: {
            _id: '$transactionDetails.service',
            totalTransactions: { $sum: 1 },
          },
        },
        {
          $sort: { totalTransactions: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            serviceType: '$_id',
            totalTransactions: 1,
          },
        },
      ]);
    } catch (error) {
      console.error('Error getting top services:', error);
      throw new Error('Could not fetch top services');
    }
  }

  async getTopReferrals() {
    try {
      const referralLevels = ['platinum', 'gold', 'bronze', 'steel'];
      return await this.userRepo.aggregate([
        {
          $addFields: {
            referralLevelIndex: {
              $indexOfArray: [referralLevels, '$referralLevel'],
            },
          },
        },
        {
          $sort: {
            referralLevelIndex: 1,
          },
        },
        {
          $group: {
            _id: '$referralLevel',
            topUsers: {
              $push: {
                user: '$username',
                referralLevel: '$referralLevel',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            referralLevel: '$_id',
            topUsers: { $slice: ['$topUsers', 3] },
          },
        },
      ]);
    } catch (error) {
      console.error('Error getting top referrals:', error);
      throw new Error('Could not fetch top referrals');
    }
  }

  async getActiveUsersByTransaction() {
    try {
      return await this.transactionRepo.aggregate([
        {
          $addFields: {
            userIdAsObjectId: { $toObjectId: '$user' },
          },
        },
        {
          $group: {
            _id: '$userIdAsObjectId',
            totalTransactions: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $sort: { totalTransactions: -1 },
        },
        {
          $limit: 5,
        },
        {
          $project: {
            _id: 0,
            userId: '$user.username',
            totalTransactions: 1,
          },
        },
      ]);
    } catch (error) {
      console.error('Error getting active users by transaction:', error);
      throw new Error('Could not fetch active users by transaction');
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
