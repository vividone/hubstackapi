import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { Wallet, WalletSchema } from 'src/entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [WalletService, WalletRepository],
  controllers: [WalletController],
  exports: [WalletRepository, WalletService],
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule,
    UsersModule
]})
export class WalletModule {}
