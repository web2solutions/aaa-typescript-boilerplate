import {
  LoginCustomValueObject,
  EmailAddressValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/domains/valueObjects';

export interface RequestCreateUser {
  firstName: string;
  lastName?: string;
  avatar?: string;
  login: LoginCustomValueObject;
  emails: EmailAddressValueObject[];
  documents?: DocumentValueObject[]
  phones?: PhoneValueObject[];
  roles?: string[]
}
