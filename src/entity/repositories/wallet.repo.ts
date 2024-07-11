import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Wallet, WalletDocument } from '../schema/wallet.schema';

@Global()
@Injectable()
export class WalletRepository extends EntityRepository<WalletDocument> {
  constructor(@InjectModel(Wallet.name) WalletModel: Model<WalletDocument>) {
    super(WalletModel);
  }
}
