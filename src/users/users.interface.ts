export interface Users {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  password: string;
}

export interface IAddUserPayload {
  orgId: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  password: string;
}

export interface IGetUserByEmailPayload {
  email?: string;
  employeeId?: string;
}
