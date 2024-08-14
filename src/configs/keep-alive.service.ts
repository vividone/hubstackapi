import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class KeepAliveService {
  private readonly logger = new Logger(KeepAliveService.name);

  @Cron('*/1 * * * *') 
  handleCron() {
    this.logger.debug('Keep-alive cron job running every minute to keep the server alive.');
  }
}
