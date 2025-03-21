import { HttpStatus } from '@nestjs/common';

export interface IStandardResponse {
  statusCode: HttpStatus;
  message: string;
  data: any;
}

export enum ResponseMessages {
  success = 'Success!',
  error = 'Error! Request failed',
}
