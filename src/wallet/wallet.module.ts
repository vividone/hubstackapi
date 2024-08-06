import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { Wallet, WalletSchema } from 'src/entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { ApiKeyModule } from 'src/auth/apikey.module';
import { TransactionModule } from 'src/transactions/transaction.module';
import { FlutterwaveWalletService } from './wallet-flutterwave.service';
import { PaystackWalletService } from './wallet-paystack.service';

@Module({
  providers: [WalletService, FlutterwaveWalletService,PaystackWalletService, WalletRepository, ApiKeyGuard],
  controllers: [WalletController],
  exports: [WalletRepository, WalletService],
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TransactionModule,
    JwtModule,
    UsersModule,
    ApiKeyModule,
  ],
})
export class WalletModule {}
