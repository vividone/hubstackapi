import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyService } from './apikey.service';
import { ApiKeyController } from './apikey.controller';
import { ApiKey, ApiKeySchema } from 'src/entity';
import { ApiKeyRepository } from 'src/entity/repositories/apikey.repo';

@Module({
  providers: [ApiKeyService, ApiKeyRepository],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, ApiKeyRepository],
  imports: [
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
})
export class ApiKeyModule {}
