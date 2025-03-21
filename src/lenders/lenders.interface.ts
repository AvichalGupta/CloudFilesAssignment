export interface Lenders {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IAddLenderPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IGetLenderByEmailPayload {
  email?: string;
  id?: string;
}

export interface IEditLenderPayload {
  id: string;
  firstName: string;
  lastName: string;
}
