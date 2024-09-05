import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/entity/repositories/category.repo';
import { Category, CategorySchema } from 'src/entity';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyGuard } from 'src/auth/apikey.guard';
import { ApiKeyModule } from 'src/auth/apikey.module';
import { BillPaymentCategoryService } from './billpayment.category.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  providers: [CategoryService, BillPaymentCategoryService, CategoryRepository, ApiKeyGuard],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ApiKeyModule,
    ProductModule,
  ],
  exports: [],
})
export class CategoryModule {}
