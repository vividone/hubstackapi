// import { Injectable } from '@nestjs/common';
// import { TransactionRepository } from 'src/entity/repositories/transaction.repo';
// import { WalletRepository } from 'src/entity/repositories/wallet.repo';
// import { UsersService } from 'src/users/users.service';

// @Injectable()
// export class BillPaymentService {
//   constructor(
//     private readonly userService: UsersService,
//     private readonly transactionRepo: TransactionRepository,
//     private readonly walletRepo: WalletRepository,
//   ) {}

//   async payBills(billPaymentDto: BillPaymentTransaction, userId: string) {
//     const { paymentCode, customerId } = billPaymentDto;

//     //Validate Customer
//     const validateCustomer = await this.validateCustomer(
//       paymentCode,
//       customerId,
//     );

//     if (!validateCustomer) {
//       return 'Customer data is invalid';
//     } else {
//       //
//       if (paymentMode.wallet) {
//         const payWithWallet = await this.processBillPaymentViaWallet(
//           billPaymentDto,
//           userId,
//         );

//         if (payWithWallet.transactionStatus === transactionStatus.Successful) {
//           const reference = this.generateRequestReference();
//           const transactionData = {
//             transactionReference: reference,
//             amount: billPaymentDto.amount,
//             transactionType: transactionType.BillPayment,
//             transactionStatus: transactionStatus.Pending,
//             paymentMode: billPaymentDto.paymentMode,
//             transactionDetails: billPaymentDto,
//             user: userId,
//           };
//           const createTransaction =
//             await this.createTransaction(transactionData);
//           return createTransaction;
//         }
//       }
//     }
//   }
// }
