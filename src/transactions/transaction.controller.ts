import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import {
  BillPaymentTransaction,
  BuyUnitTransaction,
  NINDetailsTransaction,
  NINValidateTransaction,
  PaymentValidation,
  TransactionDto,
} from './transaction.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { CustomRequest } from 'src/configs/custom_request';
import { ApiKeyGuard } from 'src/auth/apikey.guard';

@ApiTags('Transactions')
@Controller('transact')
@UseGuards(ApiKeyGuard)
export class TransactionController {
  constructor(private readonly transactService: TransactionService) {}

  // @Roles('Admin')
  // @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: [TransactionDto],
    description: 'expected response',
  })
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

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: [TransactionDto],
    description: 'expected response',
  })
  @ApiOperation({
    summary:
      'Get transactions by type fundwalet, debitwallet, billpayment, buyunit, ninsearch',
  })
  @Get('/all/:transactionType')
  async getTransactions(
    @Req() request: CustomRequest,
    @Param('transactionType') transactionType: string,
  ) {
    const userId = request.user.id;

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
    type: [TransactionDto],
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Get wallet transactions by logged in user' })
  @Get('/wallet-transactions/')
  async getWalletTransactions(@Req() request: CustomRequest) {
    const userId = request.user.id;

    try {
      const getTransaction =
        await this.transactService.getWalletTransactions(userId);
      return getTransaction;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while retrieving transaction');
      }
    }
  }

  @Roles('Agent', 'Admin', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Get all transactions' })
  @Get('/transaction/:userId/:transactionId')
  async getTransaction(
    @Param('userid') userId: string,
    @Param('transactionId') transactionId: string,
  ) {
    try {
      const getTransaction = await this.transactService.getTransaction(
        userId,
        transactionId,
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

  @Roles('Agent')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
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


  @Post('/:txrf')
  async getdetails(
    @Param('txrf') reference: string,
  ) {
    try {
      const units = await this.transactService.verifyFLWPayment(reference);
      return units;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred getting trans details');
      }
    }
  }


  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'NIN Validation' })
  @Post('/:userId/nin-validate')
  async ninValidate(
    @Body() ninTransaction: NINValidateTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      return await this.transactService.ninValidate(ninTransaction, userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
        'An error occurred while performing NIN operation.',
      );
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'NIN Details' })
  @Post('/:userId/nin')
  async nin(
    @Body() userDetails: NINDetailsTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      return await this.transactService.ninDetails(userDetails, userId);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message,
        'An error occurred while performing NIN operation.',
      );
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
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Pay Electricity Bill' })
  @Post('/:userId/pay-bill/electricity')
  async payBill(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payBills(billPaymentDto, userId);
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while paying Electricity bill');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Pay Cable Bills' })
  @Post('/:userId/pay-bill/cable')
  async payCableBill(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payBills(billPaymentDto, userId);
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error);
      } else {
        throw new Error('An error occurred while paying cable bill');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'fund betting account' })
  @Post('/:userId/pay-bill/betting')
  async fundBettingAccount(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payBills(billPaymentDto, userId);
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while funding betting account');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'pay internet bills' })
  @Post('/:userId/pay-bill/internet')
  async payInternetBills(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payBills(billPaymentDto, userId);
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while paying internet bills');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'Expected response',
  })
  @ApiOperation({ summary: 'Buy Airtime' })
  @Post('/:userId/pay-bill/buy-airtime')
  async buyAirtime(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payPhoneBills(
        billPaymentDto,
        userId,
      );
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      } else if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        console.error('Error occurred:', error);
        throw new BadRequestException(
          'An error occurred while buying airtime. Please try again later.',
        );
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Buy Data' })
  @Post('/:userId/pay-bill/buy-data')
  async buyData(
    @Body() billPaymentDto: BillPaymentTransaction,
    @Param('userId') userId: string,
  ) {
    try {
      const bill = await this.transactService.payPhoneBills(
        billPaymentDto,
        userId,
      );
      return bill;
    } catch (error) {
      if (error.message.includes('Insufficient Wallet Balance')) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please top up your wallet and try again.',
        );
      }
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while Buying Data');
      }
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({
    type: TransactionDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Verify transaction' })
  @Post('/:transactionId/pay-bill/complete')
  async billPaymentCompletion(
    @Body() validationDto: PaymentValidation,
    @Param('transactionId') transactionId: string,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user.id;
      const validatePayment = await this.transactService.sendPaymentAdvice(
        validationDto,
        userId,
        transactionId,
      );
      return validatePayment;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while completing payment');
      }
    }
  }
}
