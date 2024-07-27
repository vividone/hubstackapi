import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import {
  BillPaymentTransaction,
  BuyUnitTransaction,
  FundWalletTransaction,
  InitializeWalletFunding,
  NINTransaction,
  Transaction,
} from './transaction.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('transact')
export class TransactionController {
  constructor(private readonly transactService: TransactionService) {}

  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: Transaction, description: 'expected response' })
  @ApiOperation({ summary: 'Get all transactions' })
  @Get('/all')
  async getAllTransactions() {
    try {
      const allTransactions = await this.transactService.getAllTransactions();
      return allTransactions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while retrieving all transactions');
      }
    }
  }

  @Roles('Agent', 'Admin', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: Transaction, description: 'expected response' })
  @ApiOperation({ summary: 'Get all transactions' })
  @Get('/all/:userId/:transactionType')
  async getTransactions(
    @Param('userid') userId: string,
    @Param('transactionType') transactionType: string,
  ) {
    try {
      const getTransaction = await this.transactService.getTransactions(
        userId,
        transactionType,
      );
      return getTransaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while retrieving transaction');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: FundWalletTransaction,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Verify wallet funding' })
  @Post('/:userId/fund-wallet/verify')
  async verifyFunding(
    @Body() fundWalletDto: FundWalletTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const wallet = await this.transactService.fundWalletProcess(
        fundWalletDto,
        userId,
      );
      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while funding wallet');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: FundWalletTransaction,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Fund user wallet' })
  @Post('/fund-wallet/initialize')
  async fundWallet(
    @Body() fundWalletDto: InitializeWalletFunding,
  ) {
    try {
      const wallet = await this.transactService.initializePaystackWalletFunding(
        fundWalletDto,
      );
      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while funding wallet');
      }
    }
  }


  @Roles('Agent')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: BuyUnitTransaction,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Buy Units' })
  @Post('/:userId/buy-units')
  async buyUnit(
    @Body() buyUnitsDto: BuyUnitTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const units = await this.transactService.buyUnits(buyUnitsDto, userId);
      return units;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred in the process of buying units');
      }
    }
  }

  @Roles('Agent')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: NINTransaction,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'NIN Search' })
  @Post('/:userId/nin-search')
  async debitUnit(
    @Body() ninTransaction: NINTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const wallet = await this.transactService.ninSearch(
        ninTransaction,
        userId,
      );
      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while retrieving the wallet');
      }
    }
  }

  // @Post('fund')
  // async fundPaystackWallet(
  //   @Body('email') email: string,
  //   @Body('amount') amount: number,
  //   @Body('reference') reference: string,
  // ) {
  //   try {
  //     const result = await this.transactService.initializeWalletFunding(email, amount, reference);
  //     return { success: true, data: result };
  //   } catch (error) {
  //     return { success: false, message: error.message };
  //   }
  // }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: BillPaymentTransaction,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Pay Bill' })
  @Post('/:userId/pay-bill/')
  async payBill(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payBills(billPaymentDto, userId);
      return bill;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while paying the bill');
      }
    }
  }
}
