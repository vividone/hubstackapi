import { Injectable } from '@nestjs/common';
import { CategoryRepository } from 'src/entity/repositories/category.repo';
import axios from 'axios';

@Injectable()
export class BillPaymentCategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}


async getBillPaymentCategories() {
    const categories = await this.categoryRepo.find({
      categoryType: 'billpayments',
    });
    return categories;
  }

  async getBillers(categoryId: number) {
    const baseUrl: string = process.env.ISW_BASE_URL;
    const TerminalID: string = process.env.ISW_TERMINAL_ID;
    let token: string;

    const url = `${baseUrl}/services?categoryId=${categoryId}`;

    try {
      const authResponse = await this.genISWAuthToken();
      token = authResponse.access_token;
      // console.log('isw token', token);
    } catch (error) {
      // console.error('Error fetching auth token:', error.message);
      throw new Error('Failed to authenticate');
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          TerminalID,
          'Content-Type': 'application/json',
        },
      });

      // console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving billers',
      );
    }
  }

  async getBillerServices(billerId: number) {
    const baseUrl: string = process.env.ISW_BASE_URL;
    const TerminalID: string = process.env.ISW_TERMINAL_ID;
    let token: string;
    console.log(TerminalID);
    const url = `${baseUrl}/services/options?serviceid=${billerId}`;

    try {
      const authResponse = await this.genISWAuthToken();
      token = authResponse.access_token;
      // console.log('isw token', token);
    } catch (error) {
      // console.error('Error fetching auth token:', error.message);
      throw new Error('Failed to authenticate');
    }

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          TerminalID,
          'Content-Type': 'application/json',
        },
      });

      // console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      this.handleAxiosError(
        error,
        'An error occurred while retrieving billers',
      );
    }
  }

  private async genISWAuthToken() {
    const baseUrl: string = process.env.ISW_PASSAUTH_URL;
    const secKey: string = process.env.ISW_SECRET_KEY;
    const clientId: string = process.env.ISW_CLIENT_ID;
    const data = 'grant_type=client_credentials&scope=profile';

    try {
      const response = await axios.post(`${baseUrl}`, data, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${secKey}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      // console.log('ISW Auth', response.data);
      return response.data;
    } catch (error) {
      this.handleAxiosError(error, 'An error occurred authenticating!');
    }
  }


  private handleAxiosError(error: any, customMessage: string) {
    if (error.response) {
      console.error(
        `${customMessage} - Response Status: ${error.response.status}`,
      );
      console.error('Response Data:', error.response.data);
    } else if (error.request) {
      console.error(`${customMessage} - No response received:`, error.request);
    } else {
      console.error(
        `${customMessage} - Error setting up request:`,
        error.message,
      );
    }
    throw new Error(customMessage);
  }
}