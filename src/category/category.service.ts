import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CategoryDto } from './category.dto';
import { CategoryRepository } from 'src/entity/repositories/category.repo';
import axios from 'axios';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async createCategory(categoryDto: CategoryDto) {
    const createdProduct = await this.categoryRepo.create({ ...categoryDto });
    return createdProduct;
  }

  async getBillPaymentCategories() {
    const categories = await this.categoryRepo.find({
      categoryType: 'billpayment',
    });
    return categories;
  }

  private async genISWAuthToken() {
    const baseUrl: string = process.env.ISW_PASSAUTH_URL;
    const secKey: string = process.env.ISW_SECRET_KEY;

    const url = `${baseUrl}`;

    try {
      const request = axios.post(url, {
        headers: {
          Authorization: `Basic ${secKey}`,
        },
        grant_type: 'client_credentials',
        scope: 'profile',
      });

      const response = await request;

      return response;
    } catch (error) {
      this.handleAxiosError(error, 'An error occurred authenticating!');
    }
  }

  async getBillers(categoryId: number) {
    const baseUrl: string = process.env.ISW_BASE_URL;
    const TerminalID: string = process.env.ISW_TERMINAL_ID;
    const response = await this.genISWAuthToken();
    const { token } = response.data;
    const url = `${baseUrl}/services?categoryId=${categoryId}`;
    console.log('URL: ', url);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          TerminalID: `${TerminalID}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Response: ', response);
      return response;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving billers',
      );
    }
  }

  private handleAxiosError(error: any, defaultMessage: string) {
    if (error.response) {
      console.error('HTTP Error:', defaultMessage);
      throw new BadRequestException(defaultMessage);
    } else if (error.request) {
      console.error('No response received from the server');
      throw new InternalServerErrorException(
        'No response received from the server',
      );
    } else {
      console.error('Error message:', 'An unexpected error occurred');
      throw new InternalServerErrorException(defaultMessage);
    }
  }
}
