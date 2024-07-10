import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  private readonly baseUrl : string = process.env.FLW_BASE_URL ;
  private readonly secretKey: string = process.env.FLW_SECRET_KEY;

  
}
