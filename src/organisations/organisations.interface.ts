export interface Organisations {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IAddOrgPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IGetOrgByEmailPayload {
  email?: string;
  id?: string;
}
