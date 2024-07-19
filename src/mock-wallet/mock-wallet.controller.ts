import {
  Controller,
  Post,
  Body,
  Req,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CustomRequest } from 'src/configs/custom_request';
import { CreateMockWalletDto, EstMockWalletDto } from './mock.wallet.dto';
import { MockWalletService } from './mock-wallet.service';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

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
}
