import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
import {
  Transaction,
  TransactionSchema,
} from 'src/entity/schema/transaction.schema';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { WalletModule } from 'src/wallet/wallet.module';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { ApiKeyModule } from 'src/auth/apikey.module';

@Module({
  providers: [TransactionService, TransactionRepository, ApiKeyGuard],
  controllers: [TransactionController],
  exports: [TransactionRepository, TransactionService],
  imports: [
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule,
    UsersModule,
    ApiKeyModule,
    forwardRef(() => WalletModule),
  ],
})
export class TransactionModule {}
