import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/entity/repositories/product.repo';
import { NinDataDto, NinDto, ProductDto } from './product.dto';
import axios from 'axios';

@Injectable()
export class NinService {
  constructor(private readonly productRepo: ProductRepository) { }

  async validateNIN(ninDto: NinDto){
    
    const url = `${process.env.CKID_BASE_URL}/identity/nin-direct`;
    const token = process.env.CKID_TOKEN;

    try {
        const { nin } = ninDto;
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

  async getNIN(ninDataDto: NinDataDto){
    
    const url = `${process.env.CKID_BASE_URL}/identity/nin-demo`;
    const token = process.env.CKID_TOKEN;
    try {
        const { firstname, lastname, dateOfBirth, gender } = ninDataDto;
      const response = await axios.post(
        url,
        {
          firstname,
          lastname,
          dateOfBirth,
          gender, 
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
