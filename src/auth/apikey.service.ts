import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiKeyRepository } from 'src/entity/repositories/apikey.repo';

@Injectable()
export class ApiKeyService {
  constructor(private readonly apiKeyRepo: ApiKeyRepository) {}

  async isKeyValid(apiKey: string) {
    console.log(apiKey);
    let valid = false;
    const response = await this.apiKeyRepo.findOne({ secretKey: apiKey });
    if (!response) {
      return valid;
    } else {
      valid = true;
      return valid;
    }
  }

  async generateApiKey(appName: string) {
    const key = this.generateKey();
    const apiData = {
      appName: appName,
      secretKey: key,
    };
    console.log(apiData);
    try {
      const createApiKey = await this.apiKeyRepo.create(apiData);
      return createApiKey;
    } catch (error) {
      this.handleAxiosError(error, 'Error creating API Key!');
    }
  }

  private generateKey(): string {
    const characters =
      'abcdefghIjklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const prefix = 'STK_KEY-';
    let result = prefix;
    const randomLength = 80 - prefix.length;
    for (let i = 0; i < randomLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }

    return result;
  }

  private handleAxiosError(error: any, defaultMessage: string) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, statusText, data } = error.response;
      console.error('HTTP Error:', defaultMessage, status, statusText, data);
      throw new BadRequestException({
        message: defaultMessage,
        statusCode: status,
        statusText: statusText,
        details: data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from the server', error.request);
      throw new InternalServerErrorException(
        'No response received from the server',
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new InternalServerErrorException(defaultMessage);
    }
  }
}
