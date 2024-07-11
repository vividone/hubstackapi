import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './create.wallet.dto';
import { JwtAuthGuard } from 'src/role_auth_middleware/jwt-auth.guard';
import { RolesAuth } from 'src/role_auth_middleware/role.auth';
import { Roles } from 'src/role_auth_middleware/roles.decorator';
import { CustomRequest } from 'src/configs/custom_request';

@Controller('wallet')
export class WalletController {
    constructor(
        private readonly walletService: WalletService
    ) { }

    @UseGuards(JwtAuthGuard, RolesAuth)
    @Roles('SuperAgent', 'Agent', 'Individual')
    @Post('create-account')
    async createSubaccount(@Body() createWalletDto: CreateWalletDto, @Req() request: CustomRequest) {
        try {
            const userId = request.user.id;
            const result = await this.walletService.createSubaccount(createWalletDto, userId);
            return result;
        } catch (error) {
            console.error(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}