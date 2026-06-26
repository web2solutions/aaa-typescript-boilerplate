import { IPagingRequest } from '@src/modules/port/IPagingRequest';
import { IServiceResponse } from '@src/modules/port/IServiceResponse';
import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { RequestCreateDocument } from '@src/modules/Users/interface/dto/RequestCreateDocument';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { RequestUpdateDocument } from '@src/modules/Users/interface/dto/RequestUpdateDocument';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdatePassword } from '@src/modules/Users/interface/dto/RequestUpdatePassword';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestUpdateUser } from '@src/modules/Users/interface/dto/RequestUpdateUser';

export interface IUserUseCases {
  create(data: RequestCreateUser): Promise<IServiceResponse<IUser>>;
  update(id: string, data: RequestUpdateUser): Promise<IServiceResponse<IUser>>;
  delete(id: string): Promise<IServiceResponse<boolean>>;
  getOneById(id: string): Promise<IServiceResponse<IUser>>;
  getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IUser[]>>;
  updatePassword(id: string, data: RequestUpdatePassword): Promise<IServiceResponse<IUser>>;
  createDocument(id: string, data: RequestCreateDocument): Promise<IServiceResponse<IUser>>;
  updateDocument(
    id: string,
    documentId: string,
    data: RequestUpdateDocument
  ): Promise<IServiceResponse<IUser>>;
  deleteDocument(id: string, documentId: string): Promise<IServiceResponse<IUser>>;
  createPhone(id: string, data: RequestCreatePhone): Promise<IServiceResponse<IUser>>;
  updatePhone(
    id: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IUser>>;
  deletePhone(id: string, phoneId: string): Promise<IServiceResponse<IUser>>;
  createEmail(id: string, data: RequestCreateEmail): Promise<IServiceResponse<IUser>>;
  updateEmail(
    id: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IUser>>;
  deleteEmail(id: string, emailId: string): Promise<IServiceResponse<IUser>>;
}
