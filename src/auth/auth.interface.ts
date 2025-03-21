export enum Roles {
  LENDER = 'lender',
  ORG = 'org',
  USER = 'user',
}

export interface ILoginPayload {
  email: string;
  password: string;
}
