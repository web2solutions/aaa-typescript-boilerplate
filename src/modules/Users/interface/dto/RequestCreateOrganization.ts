import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';

export interface RequestCreateOrganization {
  name: string;
  address?: RequestCreateAddress[];
  phone?: RequestCreatePhone[];
  email?: RequestCreateEmail[];
  users?: string[];
}
