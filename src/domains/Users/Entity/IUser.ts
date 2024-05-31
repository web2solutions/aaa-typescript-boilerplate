import {
  LoginCustomValueObject,
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/domains/valueObjects';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  login: LoginCustomValueObject;
  emails: EmailValueObject[];
  documents?: DocumentValueObject[];
  phones?: PhoneValueObject[];
  roles: string[];
}
