import { HttpStatus, Injectable } from '@nestjs/common';
import {
  IAddLenderPayload,
  IEditLenderPayload,
  IGetLenderByEmailPayload,
  Lenders,
} from './lenders.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class LendersService {
  private lenders: Lenders[];
  constructor() {
    this.lenders = [];
  }

  public getAllLenders() {
    return this.lenders;
  }

  public getLenderByEmailOrId(requestBody: IGetLenderByEmailPayload) {
    let doesLenderExist: Lenders | undefined;
    if (requestBody.email) {
      doesLenderExist = this.getAllLenders().find(
        (lender) => lender.email === requestBody.email,
      );
    } else if (requestBody.id) {
      doesLenderExist = this.getAllLenders().find(
        (lender) => lender.id === requestBody.id,
      );
    }

    if (!doesLenderExist) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Lender does not exists with provided data.',
      };
    }

    return {
      lender: doesLenderExist,
    };
  }

  public addLender(requestBody: IAddLenderPayload) {
    const doesLenderExist = this.lenders.find(
      (lender) => lender.email === requestBody.email,
    );

    if (doesLenderExist) {
      throw {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Lender alredy exists with provided email, please login.',
      };
    }

    const newLenderEntry = {
      id: randomUUID(),
      ...requestBody,
    };

    this.lenders.push(newLenderEntry);

    return {
      lenderId: newLenderEntry.id,
    };
  }

  public editLender(requestBody: IEditLenderPayload) {
    const lenderObject: Lenders = this.getLenderByEmailOrId({
      id: requestBody.id,
    }).lender;

    if (requestBody.firstName) {
      lenderObject.firstName = requestBody.firstName;
    }

    if (requestBody.lastName) {
      lenderObject.lastName = requestBody.lastName;
    }

    const lenderIndex = this.getAllLenders().findIndex(
      (lender) => lenderObject.id === lender.id,
    );
    this.lenders[lenderIndex] = lenderObject;
  }
}
