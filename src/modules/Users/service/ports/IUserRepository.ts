import { IPagingRequest, IPagingResponse } from '@src/modules/port';

import { User } from '@src/modules/Users/domain/Model/User';
import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { RequestUpdateUser } from '@src/modules/Users/interface/dto/RequestUpdateUser';
import { RequestUpdatePassword } from '@src/modules/Users/interface/dto/RequestUpdatePassword';
import { RequestCreateDocument } from '@src/modules/Users/interface/dto/RequestCreateDocument';
import { RequestUpdateDocument } from '@src/modules/Users/interface/dto/RequestUpdateDocument';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';

export interface IUserRepository {
  create(data: RequestCreateUser): Promise<User>;
  update(id: string, data: RequestUpdateUser): Promise<User>;
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<User>;
  getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<User[]>>;
  updatePassword(id: string, data: RequestUpdatePassword): Promise<User>;
  createDocument(userId: string, data: RequestCreateDocument): Promise<User>;
  updateDocument(userId: string, documentId: string, data: RequestUpdateDocument): Promise<User>;
  deleteDocument(userId: string, documentId: string): Promise<User>;
  createPhone(userId: string, data: RequestCreatePhone): Promise<User>;
  updatePhone(userId: string, phoneId: string, data: RequestUpdatePhone): Promise<User>;
  deletePhone(userId: string, phoneId: string): Promise<User>;
  createEmail(userId: string, data: RequestCreateEmail): Promise<User>;
  updateEmail(userId: string, emailId: string, data: RequestUpdateEmail): Promise<User>;
  deleteEmail(userId: string, emailId: string): Promise<User>;
}
