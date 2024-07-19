import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from 'src/entity/repositories/category.repo';
import { Category, CategorySchema } from 'src/entity';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  providers: [CategoryService, CategoryRepository ],
  controllers: [CategoryController],
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  exports: [],
})
export class CategoryModule {}
