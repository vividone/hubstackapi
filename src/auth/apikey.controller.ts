import { Body, Controller, Post } from '@nestjs/common';
import { ApiKeyService } from './apikey.service';
import { generateApiKey } from './dto/apikey.dto';

@Controller('apikey')
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post('generate-key')
  async generateKey(@Body() appNameData: generateApiKey) {
    const { appname } = appNameData;
    return this.apiKeyService.generateApiKey(appname);
  }
}
