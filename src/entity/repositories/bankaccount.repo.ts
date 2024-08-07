import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { BankAccount, BankAccountDocument } from '../schema/bankaccount.schema';

@Global()
@Injectable()
export class BankAccountRepository extends EntityRepository<BankAccountDocument> {
  constructor(
    @InjectModel(BankAccount.name) BankAccountModel: Model<BankAccountDocument>,
  ) {
    super(BankAccountModel);
  }
}
