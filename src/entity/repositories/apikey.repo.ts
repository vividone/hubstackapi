import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { ApiKey, ApiKeyDocument } from '../schema/apikey.schema';

@Global()
@Injectable()
export class ApiKeyRepository extends EntityRepository<ApiKeyDocument> {
  constructor(@InjectModel(ApiKey.name) ApiKeyModel: Model<ApiKeyDocument>) {
    super(ApiKeyModel);
  }
}
