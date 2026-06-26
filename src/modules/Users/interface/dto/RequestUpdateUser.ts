import {
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';

export interface RequestUpdateUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  // password: string;
  avatar: string;
  organization?: string;
  emails: EmailValueObject[];
  documents?: DocumentValueObject[]
  phones?: PhoneValueObject[];
  roles?: string[]
}
