import { RequestCreateUser } from '@src/domains/Users';
import { EmailValueObject } from '@src/domains/valueObjects';

export interface IRegisterRequest extends RequestCreateUser {
  firstName: string;
  username: string;
  password: string;
  emails: EmailValueObject[];
}
