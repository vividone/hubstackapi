import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories';
import { Admin, AdminDocument } from '../schema/admin.schema';

@Global()
@Injectable()
export class AdminRepository extends EntityRepository<AdminDocument> {
  constructor(@InjectModel(Admin.name) AdminModel: Model<AdminDocument>) {
    super(AdminModel);
  }
}
