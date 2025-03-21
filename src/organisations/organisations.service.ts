import { Injectable } from '@nestjs/common';
import {
  IAddOrgPayload,
  IGetOrgByEmailPayload,
  Organisations,
} from './organisations.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class OrganisationsService {
  private organisations: Organisations[];
  constructor() {
    this.organisations = [];
  }

  public getAllOrganisations() {
    return this.organisations;
  }

  public getOrganisationsByEmailOrId(requestBody: IGetOrgByEmailPayload) {
    let doesOrganisationsExist: Organisations | undefined;
    if (requestBody.email) {
      doesOrganisationsExist = this.getAllOrganisations().find(
        (organisations) => organisations.email === requestBody.email,
      );
    } else if (requestBody.id) {
      doesOrganisationsExist = this.getAllOrganisations().find(
        (organisations) => organisations.id === requestBody.id,
      );
    }

    if (!doesOrganisationsExist) {
      throw {
        statusCode: 404,
        message: 'Organisations does not exists with provided data.',
      };
    }

    return {
      organisations: doesOrganisationsExist,
    };
  }

  public addOrganisations(requestBody: IAddOrgPayload) {
    const doesOrganisationsExist = this.organisations.find(
      (organisations) => organisations.email === requestBody.email,
    );

    if (doesOrganisationsExist) {
      throw {
        statusCode: 400,
        message:
          'Organisations alredy exists with provided email, please login.',
      };
    }

    const newOrganisationsEntry = {
      id: randomUUID(),
      ...requestBody,
    };

    this.organisations.push(newOrganisationsEntry);

    return {
      organisationsId: newOrganisationsEntry.id,
    };
  }
}
