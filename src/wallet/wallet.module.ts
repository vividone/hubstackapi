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
import { PaystackWalletService } from './paystack.service';
import {
  BankAccount,
  BankAccountSchema,
} from 'src/entity/schema/bankaccount.schema';
import { BankAccountRepository } from 'src/entity/repositories/bankaccount.repo';
import { FlutterwaveWalletService } from './flutterwave.service';

@Module({
  providers: [
    WalletService,
    WalletRepository,
    ApiKeyGuard,
    BankAccountRepository,
    PaystackWalletService,
    FlutterwaveWalletService,
  ],
  controllers: [WalletController],
  exports: [WalletRepository, WalletService, BankAccountRepository],
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
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
