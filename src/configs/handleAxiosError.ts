import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export function  handleAxiosError(error: any, defaultMessage: string) {
    if (error.response) {
      const { status, statusText, data } = error.response;
      console.error('HTTP Error:', defaultMessage, status, statusText, data);
      throw new BadRequestException({
        message: defaultMessage,
        statusCode: status,
        statusText: statusText,
        details: data,
      });
    } else if (error.request) {
      throw new InternalServerErrorException('No response received from the server');
    } else {
      throw new InternalServerErrorException(defaultMessage);
    }
  }
