import { Controller, Get, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AdminProfileService } from './admin.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
@ApiTags('Admin Operations')
@Controller('admin')
@UseGuards(ApiKeyGuard)
export class AdminProfileController {
    constructor(
        private readonly adminServices: AdminProfileService,
    ){}

    @Get('/users')
    async allUsers() {
        const allUsers = await this.adminServices.countUsers()
        return allUsers;
    }

    @Get('/users/role')
    async userCount() {
        const userCount = await this.adminServices.countUsersByRole()
        return userCount;
    }

    @Get('/transactions/status')
    async allTransactionsByStatus() {
        const transactions = await this.adminServices.countTransactionsByStatus()
        return transactions;
    }

    @Get('/transactions')
    async allTransactions() {
        const allTransactions = await this.adminServices.countTransactions()
        return allTransactions;
    }

    @Get('/summary')
    async getWalletSummary() {
      try {
        const summary = await this.adminServices.getWalletSummary();
        return summary;
      } catch (error) {
        console.error('Error fetching wallet summary:', error);
        throw new InternalServerErrorException('Could not fetch wallet summary');
      }
    }
}
