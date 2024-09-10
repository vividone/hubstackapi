import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
  import { Types } from 'mongoose';
  import { UsersService } from 'src/users/users.service';
  import { WalletRepository } from 'src/entity/repositories/wallet.repo';
  import { NotificationMailingService } from 'src/mailing/notification.mails';
import { NinService } from 'src/product/nin.service';
  @Injectable()
  export class NinOPerations {
    constructor(
      private readonly userService: UsersService,
      private readonly ninservice: NinService,
      private readonly transactionRepo: TransactionRepository,
      private readonly walletRepo: WalletRepository,
      private readonly notificationMailingService: NotificationMailingService,
    ) { }

    async
  }  