import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';

export interface RequestUpdateOrganization extends RequestCreateOrganization {
  id: string;
}
