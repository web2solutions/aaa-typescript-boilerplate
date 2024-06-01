import {
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/domains/valueObjects';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
  password: string;
  emails: EmailValueObject[];
  documents?: DocumentValueObject[];
  phones?: PhoneValueObject[];
  roles: string[];
}
