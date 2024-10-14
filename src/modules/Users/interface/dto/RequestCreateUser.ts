import {
  EmailValueObject,
  DocumentValueObject,
  PhoneValueObject
} from '@src/modules/ddd/valueObjects';

export interface RequestCreateUser {
  firstName: string;
  lastName?: string;
  username: string;
  password: string;
  salt?: string;
  avatar?: string;
  emails: EmailValueObject[];
  documents?: DocumentValueObject[]
  phones?: PhoneValueObject[];
  roles?: string[]
}
