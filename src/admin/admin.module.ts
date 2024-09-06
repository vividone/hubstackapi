import { Module } from '@nestjs/common';
import { AdminProfileController } from './admin.controller';
import { AdminProfileService } from './admin.service';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { ApiKeyModule } from 'src/auth/apikey.module';
import { TransactionModule } from 'src/transactions/transaction.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { JwtService } from '@nestjs/jwt';
import { AdminRepository } from 'src/entity/repositories/admin.repository';
import { Admin, AdminSchema } from 'src/entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
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
  providers: [AdminProfileService, AdminRepository, JwtService],
  exports: [AdminProfileService, AdminRepository]
})
export class AdminProfileModule {}
