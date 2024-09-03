import { Controller, Get, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { AdminProfileService } from './admin.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
@ApiTags('Admin Operations')
@Controller('admin')
@UseGuards(ApiKeyGuard)
export class AdminProfileController {
  constructor(
    private readonly adminServices: AdminProfileService,
  ) { }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/users')
  @ApiOperation({ summary: 'Get list of users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async allUsers() {
    const allUsers = await this.adminServices.countUsers()
    return allUsers;
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/users/role')
  @ApiOperation({ summary: 'Get list of users based on role' })
  @ApiResponse({ status: 200, description: 'List of users based on role' })
  async userCount() {
    const userCount = await this.adminServices.countUsersByRole()
    return userCount;
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/transactions/status')
  @ApiOperation({ summary: 'Get list of transactions based on status' })
  @ApiResponse({ status: 200, description: 'List of transactions based on status' })
  async allTransactionsByStatus() {
    const transactions = await this.adminServices.countTransactionsByStatus()
    return transactions;
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/transactions')
  @ApiOperation({ summary: 'Get list of transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async allTransactions() {
    const allTransactions = await this.adminServices.countTransactions()
    return allTransactions;
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/wallet-summary')
  @ApiOperation({ summary: 'Get summary of wallet operations' })
  @ApiResponse({ status: 200, description: 'wallet summary' })
  async getWalletSummary() {
    try {
      const summary = await this.adminServices.getWalletSummary();
      return summary;
    } catch (error) {
      console.error('Error fetching wallet summary:', error);
      throw new InternalServerErrorException('Could not fetch wallet summary');
    }
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/top-services')
  @ApiOperation({ summary: 'Get top services based on the number of transactions' })
  @ApiResponse({ status: 200, description: 'List of top services' })
  async getTopServices() {
    try {
      const topServices = await this.adminServices.getTopServices();
      return topServices;
    } catch (error) {
      console.error('Error getting top services:', error);
      throw new InternalServerErrorException('Could not fetch top services');
    }
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/top-referrals')
  @ApiOperation({ summary: 'Get top referrals based on referral levels' })
  @ApiResponse({ status: 200, description: 'List of top referrals' })
  async getTopReferrals() {
    try {
      const topReferrals = await this.adminServices.getTopReferrals();
      return topReferrals;
    } catch (error) {
      console.error('Error getting top referrals:', error);
      throw new InternalServerErrorException('Could not fetch top referrals');
    }
  }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('Admin')
  @Get('/active-users')
  @ApiOperation({ summary: 'Get active users based on number of transactions' })
  @ApiResponse({ status: 200, description: 'List of active users by transaction' })
  async getActiveUsersByTransaction() {
    try {
      const activeUsersByTransaction = await this.adminServices.getActiveUsersByTransaction();
      return activeUsersByTransaction;
    } catch (error) {
      console.error('Error getting active users by transaction:', error);
      throw new InternalServerErrorException('Could not fetch active users by transaction');
    }
  }
}
