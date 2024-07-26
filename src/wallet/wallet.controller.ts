import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Banks, CreateWalletDto } from './wallet.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { CustomRequest } from 'src/configs/custom_request';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Wallet } from 'src/entity';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // Paystack Implementation
  // @Roles('SuperAgent', 'Agent', 'Individual')
  // @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  // @ApiOperation({ summary: 'Create wallet for a new user' })
  // @UseGuards(JwtAuthGuard, RolesAuth)
  // @Post('create-paystack-account')
  // async createDedicatedVirtualAcccount(
  //   @Body() createWalletDto: CreateWalletDto,
  //   @Req() request: CustomRequest,
  // ) {
  //   try {
  //     const userId = request.user.id;
  //     const result = await this.walletService.createCustomerWallet(
  //       createWalletDto,
  //       userId,
  //     );
  //     return result;
  //   } catch (error) {
  //     console.error(error);
  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @UseGuards(JwtAuthGuard, RolesAuth)
  @ApiCreatedResponse({ type: Banks, description: 'expected response' })
  @ApiOperation({ summary: 'Get lists of banks' })
  @Get('banks')
  async getBankList() {
    try {
      const result = await this.walletService.getBanks();
      return result;
    } catch (error) {
      // console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Flutterwave Implementation

  @Roles('SuperAgent', 'Agent', 'Individual')
  @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  @ApiOperation({ summary: 'Create wallet for a new user' })
  @UseGuards(JwtAuthGuard, RolesAuth)
  // @Post('create-account')
  @Post('create-wallet')
  async createCustomerWallet(
    @Body() createWalletDto: CreateWalletDto,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user.id;
      const result = await this.walletService.createCustomerWallet(
        createWalletDto,
        userId,
      );
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Roles('Admin', 'Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  @ApiOperation({ summary: 'Get wallet details of a user' })
  @Get('/:userid')
  async getUserWallet(
    @Param('userid') userid: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    return this.walletService.getUserWallet(userid);
  }

  // @Roles('SuperAgent', 'Agent', 'Individual')
  // @UseGuards(JwtAuthGuard)
  // @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  // @ApiOperation({ summary: 'Get static account details of a user' })
  // @Get('account/:accountReference')
  // async getAStaticVirtualAccount(
  //   @Param('accountReference') accountReference: string,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @Req() request: CustomRequest,
  // ) {
  //   return this.walletService.getAStaticAccount(accountReference);
  // }

  // @Roles('SuperAgent', 'Agent', 'Individual')
  // @UseGuards(JwtAuthGuard)
  // @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  // @ApiOperation({ summary: 'Get subaccount balance for wallet' })
  // @Get('account-balance/:accountReference')
  // async getSubaccountBalance(
  //   @Param('accountReference') accountReference: string,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @Req() request: CustomRequest,
  // ) {
  //   return this.walletService.getSubaccountBalance(accountReference);
  // }

  // @Roles('Admin')
  // @UseGuards(JwtAuthGuard)
  // @Get('sub-accounts')
  // async getAllSubAccounts() {
  //   return this.walletService.getAllStaticAccounts();
  // }
}
