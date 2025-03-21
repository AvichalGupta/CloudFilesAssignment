import { Injectable } from '@nestjs/common';
import {
  IAddUserPayload,
  IGetUserByEmailPayload,
  Users,
} from './users.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  private users: Users[];
  constructor() {
    this.users = [];
  }

  public getAllUsers() {
    return this.users;
  }

  public getUserByEmailOrEmployeeId(requestBody: IGetUserByEmailPayload) {
    let doesUserExist: Users | undefined;
    if (requestBody.email) {
      doesUserExist = this.getAllUsers().find(
        (user) => user.email === requestBody.email,
      );
    } else if (requestBody.employeeId) {
      doesUserExist = this.getAllUsers().find(
        (user) => user.employeeId === requestBody.employeeId,
      );
    }

    if (!doesUserExist) {
      throw {
        statusCode: 404,
        message: 'User does not exists with provided data.',
      };
    }

    return {
      user: doesUserExist,
    };
  }

  public addUser(requestBody: IAddUserPayload) {
    const doesUserExist = this.users.find(
      (user) =>
        user.email === requestBody.email ||
        user.employeeId === requestBody.employeeId,
    );

    if (doesUserExist) {
      throw {
        statusCode: 400,
        message: 'User alredy exists with provided email, please login.',
      };
    }

    const newUserEntry = {
      id: randomUUID(),
      ...requestBody,
    };

    this.users.push(newUserEntry);

    return {
      userId: newUserEntry.id,
    };
  }
}
