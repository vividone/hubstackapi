// import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

// public  handleAxiosError(error: any, defaultMessage: string) {
//     if (error.response) {
//       // The request was made and the server responded with a status code
//       // that falls out of the range of 2xx
//       const { status, statusText, data } = error.response;
//       console.error('HTTP Error:', defaultMessage, status, statusText, data);
//       throw new BadRequestException({
//         message: defaultMessage,
//         statusCode: status,
//         statusText: statusText,
//         details: data,
//       });
//     } else if (error.request) {
//       // The request was made but no response was received
//       console.error('No response received from the server', error.request);
//       throw new InternalServerErrorException('No response received from the server');
//     } else {
//       // Something happened in setting up the request that triggered an Error
//       console.error('Error message:', error.message);
//       throw new InternalServerErrorException(defaultMessage);
//     }
//   }