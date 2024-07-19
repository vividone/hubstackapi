import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { MockWallet, MockWalletDocument } from '../schema/mock.wallet.schema';

@Global()
@Injectable()
export class MockWalletRepository extends EntityRepository<MockWalletDocument> {
  constructor(
    @InjectModel(MockWallet.name) MockWalletModel: Model<MockWalletDocument>,
  ) {
    super(MockWalletModel);
  }
}
