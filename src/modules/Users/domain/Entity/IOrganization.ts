import {
  AddressValueObject,
  EmailValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';

export interface IOrganization {
  id: string;
  name: string;
  address: AddressValueObject[];
  phone: PhoneValueObject[];
  email: EmailValueObject[];
  users: string[];
}
