import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiKeyService } from './apikey.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {} // made up service for the point of the exmaple

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'] ?? req.query.api_key; // checks the header, moves to query if null
    return this.apiKeyService.isKeyValid(key);
  }
}
