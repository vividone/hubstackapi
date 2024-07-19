import { Module } from '@nestjs/common';
import { MockWalletService } from './mock-wallet.service';
import { MockWalletController } from './mock-wallet.controller';
import { MockWalletRepository } from 'src/entity/repositories/mock.wallet.repo';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { MockWallet, MockWalletSchema } from 'src/entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [MockWalletService, MockWalletRepository],
  controllers: [MockWalletController],
  exports: [MockWalletRepository, MockWalletService],
  imports: [
    MongooseModule.forFeature([{ name: MockWallet.name, schema: MockWalletSchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    JwtModule,
    UsersModule,
  ],
})
export class MockWalletModule {}
