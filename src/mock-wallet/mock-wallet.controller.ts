import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { CustomRequest } from 'src/configs/custom_request';
import { CreateMockWalletDto, EstMockWalletDto } from './mock.wallet.dto';
import { MockWalletService } from './mock-wallet.service';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MockWallet } from 'src/entity';
import { Roles } from 'src/role_auth_middleware/roles.decorator';

@ApiTags('MockWallet')
@Controller('mockwallet')
export class MockWalletController {
  constructor(private readonly mockWalletService: MockWalletService) {}

  @UseGuards(JwtAuthGuard, RolesAuth)
  @Post('create-and-validate-customer')
  @ApiCreatedResponse({
    type: EstMockWalletDto,
    description: 'expected response',
  })
  @ApiOperation({ summary: 'Get wallet details of a user' })
  async createAndValidateCustomer(
    @Body() createMockWalletDto: CreateMockWalletDto,
    @Req() request: CustomRequest,
  ) {
    try {
      const userId = request.user.id;
      const result = await this.mockWalletService.createCustomerWallet(
        createMockWalletDto,
        userId,
      );
      return result;
    } catch (error) {
      // console.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Roles('Agent', 'Individual')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: MockWallet, description: 'expected response' })
  @ApiOperation({ summary: 'Get wallet details of a user' })
  @Get('/:userid')
  async getUserWallet(
    @Param('userid') userid: string
  ) {
    try {
      const wallet = await this.mockWalletService.getUserWallet(userid);
      return wallet;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new Error('An error occurred while retrieving the wallet');
      }
    }
  }
}
