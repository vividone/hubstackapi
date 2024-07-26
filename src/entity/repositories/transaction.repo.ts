import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { TransactionDocument, Transaction } from '../schema/transaction.schema';

@Global()
@Injectable()
export class TransactionRepository extends EntityRepository<TransactionDocument> {
  constructor(
    @InjectModel(Transaction.name) TransactionModel: Model<TransactionDocument>,
  ) {
    super(TransactionModel);
  }
}
