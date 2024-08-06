import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { CreateWalletDto } from './wallet.dto';
import { WalletRepository } from 'src/entity/repositories/wallet.repo';
import { UserRepository } from 'src/entity/repositories/user.repo';
import { Types } from 'mongoose';
import { handleAxiosError } from 'src/configs/handleAxiosError';
import { WalletService } from './wallet.service';

@Injectable()
export class FlutterwaveWalletService {
    constructor(
        private readonly walletRepo: WalletRepository,
        private readonly userRepo: UserRepository,
        private readonly walletService: WalletService,
    ) { }

    async createVirtualAccount(data: CreateWalletDto, id: string) {
        const baseUrl: string = process.env.FLW_BASE_URL;
        const secretKey: string = process.env.FLW_SECRET_KEY;
        try {
            const user = await this.userRepo.findOne({ _id: id });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const email: string = user.email;
            const account_reference: string = this.walletService.generateAccountReference();
            //const country = 'NG';

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { existingAccountNumber, existingBankName, mobilenumber, ...rest } =
                data;
            const requestData = {
                ...rest,
                phonenumber: mobilenumber,
                is_permanent: true,
                tx_ref: account_reference,
            };
            // console.log('DATA TO FLW', requestData);

            const response = await axios.post(
                `${baseUrl}/virtual-account-numbers`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${secretKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            const { account_number, account_name, bank_name } = response.data.data;

            const createdVirtualAccount = {
                email: email,
                accountName: account_name,
                accountNumber: account_number,
                bankName: bank_name,
                accountReference: account_reference,
                user: user._id,
            };

            const savedVirtualAccount = await this.walletRepo.create(
                createdVirtualAccount,
            );

            return {
                message: 'Virtual Account created successfully',
                data: savedVirtualAccount,
            };
        } catch (error) {
            handleAxiosError(
                error,
                'An error occurred while creating virtual account with flutterwave',
            );
        }
    }
}