import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/entity/repositories/product.repo';
import { ProductDto } from './product.dto';
import axios from 'axios';

@Injectable()
export class NinService {
  constructor(private readonly productRepo: ProductRepository) { }

  async validateNIN(nin: string): Promise<any> {
    
    const url = `${process.env.CKID_BASE_URL}/identity/nin-direct`;
    const token = process.env.CKID_TOKEN;

    try {
      const response = await axios.post(
        url,
        {
          nin, 
          level: 1, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to validate NIN: ${error.message}`);
    }
  }
}
