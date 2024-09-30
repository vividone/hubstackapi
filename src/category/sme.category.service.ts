import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmeCategoryService {
  constructor() {}

  async getAllNetworks() {
    const baseUrl: string = process.env.SME_BASE_URL;
    const privateKey: string = process.env.SME_PRIVATE_KEY;

    const url = `${baseUrl}/networks`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${privateKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
        this.handleAxiosError(
        error,
        'An error occurred while retrieving networks',
      );
    }
  }

  async getDataPlans() {
    const baseUrl: string = process.env.SME_BASE_URL;
    const privateKey: string = process.env.SME_PRIVATE_KEY;

    const url = `${baseUrl}/data/plans`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${privateKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
        this.handleAxiosError(
        error,
        'An error occurred while retrieving data plans',
      );
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

