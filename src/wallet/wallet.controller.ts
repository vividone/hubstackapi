/* eslint-disable @typescript-eslint/no-unused-vars */
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
  NotFoundException,
  Res,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { WalletService } from './wallet.service';
import {
  BankAccount,
  Banks,
  CreateWalletDto,
  WalletFundingDto,
} from './wallet.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { CustomRequest } from 'src/configs/custom_request';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Wallet } from 'src/entity';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import {
  InitializeWalletFunding,
  TransactionDto,
  VerifyFundingDto,
} from 'src/transactions/transaction.dto';
import { FlutterwaveWalletService } from './flutterwave.service';
import { PaystackWalletService } from './paystack.service';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(ApiKeyGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionRepo: TransactionRepository,
    private readonly flutterwaveWalletService: FlutterwaveWalletService,
    private readonly paystackWalletService: PaystackWalletService,
  ) {}

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
      const result = await this.paystackWalletService.getBanks();
      return result;
    } catch (error) {
      // console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('Agent', 'Individual')
  @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  @ApiOperation({ summary: 'Create wallet for a new user' })
  @UseGuards(JwtAuthGuard, RolesAuth)
  @Post('/create-wallet')
  async createVirtualWallet(
    @Body() createWalletDto: CreateWalletDto,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user.id;
      const flutterwaveAccount =
        await this.flutterwaveWalletService.createVirtualAccount(
          createWalletDto,
          userId,
        );

      // const paystackAccount =
      //   await this.paystackWalletService.createPaystackBankAccount(
      //     createWalletDto,
      //     userId,
      //   );

      const createWallet = await this.walletService.createWallet(userId);
      return {
        WemaBank: flutterwaveAccount,
        PaystackTitan: 'Unavailable',
        MicrobizMFB: 'Unavailable',
        Wallet: createWallet,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Roles('Agent', 'Individual')
  // @UseGuards(JwtAuthGuard)
  // @ApiCreatedResponse({
  //   type: TransactionDto,
  //   description: 'expected response',
  // })
  // @ApiOperation({ summary: 'Fund user wallet' })
  // @Post('/fund-wallet/initialize')
  // async fundWallet(
  //   @Body() fundWalletDto: InitializeWalletFunding,
  //   @Req() request: CustomRequest,
  // ) {
  //   try {
  //     const userId = request.user.id;
  //     const wallet =
  //       await this.paystackWalletService.initializePaystackWalletFunding(
  //         fundWalletDto,
  //         userId,
  //       );
  //     return wallet;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw new NotFoundException(error.message);
  //     } else {
  //       throw new Error('An error occurred while funding wallet');
  //     }
  //   }
  // }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    description: 'Verify wallet funding by automatically fetching transaction',
  })
  @ApiOperation({ summary: 'Verify wallet funding' })
  @Post('fund-wallet/verify')
  async verifyFunding(@Req() request: CustomRequest) {
    const userId = request.user.id;
    const response = await this.walletService.checkAndVerifyFunding(userId);
    return response;
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retry wallet funding verification' })
  @Post('fund-wallet/retry-verify')
  async retryVerifyFunding(@Req() request: CustomRequest) {
    const userId = request.user.id;
    const response = await this.walletService.checkAndVerifyFunding(userId);
    return response;
  }

  // @Roles('Agent', 'Individual')
  // @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  // @ApiOperation({ summary: 'Create wallet for a new user' })
  // @UseGuards(JwtAuthGuard, RolesAuth)
  // @Post('/paystack/create-wallet')
  // async createCustomerWallet(
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

  @Roles('Admin', 'Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: BankAccount, description: 'expected response' })
  @ApiOperation({ summary: 'Get accounts details of the user' })
  @Get('/accounts/')
  async getUserAccount(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;

    return this.walletService.fetchBankAccounts(userId);
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  @ApiOperation({ summary: 'Get wallet balance for the the user' })
  @Get('/balance')
  async getUserWalletBalance(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;

    return this.walletService.getUserWalletBalance(userId);
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: Wallet, description: 'expected response' })
  @ApiOperation({ summary: 'Get wallet details for the the user' })
  @Get('/')
  async getUserWalletDetails(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    const userId = request.user.id;

    return this.walletService.getUserWallet(userId);
  }

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
