import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AdminProfileModule } from './admin_profile/admin_profile.module';
import { AgentProfileModule } from './agent_profile/agent_profile.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transactions/transaction.module';
import { ReferralModule } from './referrals/referral.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UsersModule,
    AdminProfileModule,
    AgentProfileModule,
    AuthModule,
    ReferralModule,
    WalletModule,
    ProductModule,
    CategoryModule,
    TransactionModule,
  ],
})
export class AppModule {}
