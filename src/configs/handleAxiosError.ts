// import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

// private handleAxiosError(error: any, defaultMessage: string) {
//     if (error.response) {
//       console.error('HTTP Error:', defaultMessage);
//       throw new BadRequestException(defaultMessage);
//     } else if (error.request) {
//       console.error('No response received from the server');
//       throw new InternalServerErrorException(
//         'No response received from the server',
//       );
//     } else {
//       console.error('Error message:', 'An unexpected error occurred');
//       throw new InternalServerErrorException(defaultMessage);
//     }
//   }
