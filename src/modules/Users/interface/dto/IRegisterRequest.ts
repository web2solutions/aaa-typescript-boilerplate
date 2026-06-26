import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { EmailValueObject } from '@src/modules/ddd/valueObjects';

export interface IRegisterRequest extends RequestCreateUser {
  firstName: string;
  username: string;
  password: string;
  emails: EmailValueObject[];
}
