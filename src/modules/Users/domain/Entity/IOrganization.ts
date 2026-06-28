import {
  AddressValueObject,
  EmailValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';

export interface IOrganization {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  address: AddressValueObject[];
  phone: PhoneValueObject[];
  email: EmailValueObject[];
  users: string[];
}
