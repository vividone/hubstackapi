import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/entity/repositories/product.repo';
import { ProductDto } from './product.dto';
import axios from 'axios';

@Injectable()
export class NinService {
  constructor(private readonly productRepo: ProductRepository) { }

  async validateNIN(nin: string): Promise<any> {
    // Define the URL (replace `{{base_url}}` with the actual base URL)
    const url = `${process.env.CKID_BASE_URL}/identity/nin-direct`;

    // Bearer token (use environment variables for security)
    const token = process.env.CKID_TOKEN;

    try {
      // Make the POST request to the API
      const response = await axios.post(
        url,
        {
          nin, // The NIN to validate
          level: 1, // Include the level if needed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Return the response data
      return response.data;
    } catch (error) {
      // Handle and throw any errors
      throw new Error(`Failed to validate NIN: ${error.message}`);
    }
  }
}
