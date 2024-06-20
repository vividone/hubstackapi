import { Global, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../entity.repositories'; 
import { Users, UserDocument } from '../schema/user.schema';


@Global()
@Injectable()
export class UserRepository extends EntityRepository <UserDocument> {
    constructor(@InjectModel(Users.name) UserModel: Model<UserDocument>) {
        super(UserModel);
    } 
}
