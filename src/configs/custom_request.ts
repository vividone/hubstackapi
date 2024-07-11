import { Request } from 'express';
import { UserDocument } from 'src/entity';

export interface CustomRequest extends Request {
  user: UserDocument;
}
