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
import { CreateWalletDto } from './create.wallet.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { CustomRequest } from 'src/configs/custom_request';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Roles('SuperAgent', 'Agent', 'Individual')
  @Post('create-account')
  async createSubaccount(
    @Body() createWalletDto: CreateWalletDto,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user.id;
      const result = await this.walletService.createSubaccount(
        createWalletDto,
        userId,
      );
      return result;
    } catch (error) {
      console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('SuperAgent', 'Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @Get('account-balance/:accountReference')
  async getSubaccountBalance(
    @Param('accountReference') accountReference: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    return this.walletService.getSubaccountBalance(accountReference);
  }

  @Roles('SuperAgent', 'Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @Get('account/:accountReference')
  async getAStaticVirtualAccount(
    @Param('accountReference') accountReference: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() request: CustomRequest,
  ) {
    return this.walletService.getAStaticAccount(accountReference);
  }

  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @Get('sub-accounts')
  async getAllSubAccounts() {
    return this.walletService.getAllStaticAccounts();
  }
}
