import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from './logger.middleware';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AgentProfileModule } from './agent_profile/agent_profile.module';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { WalletModule } from './wallet/wallet.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { TransactionModule } from './transactions/transaction.module';
import { ReferralModule } from './referrals/referral.module';
import { ApiKeyModule } from './auth/apikey.module';
import { ScheduleModule } from '@nestjs/schedule';
import { KeepAliveService } from './configs/keep-alive.service';
import { AdminProfileModule } from './admin/admin.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
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
    ApiKeyModule,
  ],
  providers: [KeepAliveService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware) // assuming you want to add some some loggerMiddleware then you can add it here
      .forRoutes('*');
  }
}
