import { Module } from '@nestjs/common';
import { AdminProfileController } from './admin.controller';
import { AdminProfileService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { ApiKeyModule } from 'src/auth/apikey.module';
import { TransactionModule } from 'src/transactions/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    WalletModule,
    UsersModule,
    TransactionModule,
    ApiKeyModule
  ],
  controllers: [AdminProfileController],
  providers: [AdminProfileService, JwtService],
})
export class AdminProfileModule {}
