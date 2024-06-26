// file deepcode ignore WrongNumberOfArguments: <same name but different functions>
// file deepcode ignore MissingArgument: <same name but different functions>
import { BaseService } from '@src/domains/ports/BaseService';
import { ServiceError } from '@src/domains/ports/ServiceError';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IServiceConfig } from '@src/domains/ports/IServiceConfig';

import {
  UserDataRepository,
  createUser,
  updateUser,
  deleteUserById,
  getUserById,
  getAllUsers,
  updatePassword,
  createDocument,
  updateDocument,
  deleteDocument,
  createPhone,
  updatePhone,
  deletePhone,
  createEmail,
  updateEmail,
  deleteEmail,
  RequestCreateUser,
  RequestUpdateUser,
  IUser,
  RequestUpdatePassword,
  RequestCreateDocument,
  RequestUpdateDocument,
  RequestCreatePhone,
  RequestUpdatePhone,
  RequestCreateEmail,
  RequestUpdateEmail
} from '@src/domains/Users';
import { IPagingRequest } from '@src/domains/ports/persistence/IPagingRequest';
import { IPagingResponse } from '@src/domains/ports/persistence/IPagingResponse';
import { canNotBeEmpty, mustBePassword } from '@src/domains/validators';
import { ServiceResponse } from '@src/infra/service/adapter/ServiceResponse';

interface IUserServiceConfig extends IServiceConfig {

}

let userService: any;

export class UserService extends BaseService<IUser, RequestCreateUser, RequestUpdateUser> {
  public dataRepository: UserDataRepository;

  public constructor(
    config: IUserServiceConfig
  ) {
    super(config);
    const { dataRepository, services } = config;
    this.dataRepository = dataRepository as UserDataRepository;
    this.services.passwordCryptoService = services!.passwordCryptoService;
  }

  public async create(data: RequestCreateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      mustBePassword('password', data.password);

      const newData = { ...data };
      const { hash, salt } = await this.services.passwordCryptoService.hash(data.password);
      newData.password = hash;
      newData.salt = salt;

      const document = await createUser((newData ?? {}), this.dataRepository);
      serviceResponse.result = document as IUser;
    } catch (error) {
      serviceResponse.error = new ServiceError(error as Error);
    }
    return serviceResponse;
  }

  // eslint-disable-next-line class-methods-use-this
  public async update(id: string, data: RequestUpdateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await updateUser(id, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {};
    try {
      const deleted = await deleteUserById(id, this.dataRepository);
      serviceResponse.result = deleted;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async getOneById(id: string): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await getUserById(id, this.dataRepository);
      serviceResponse.result = user as IUser;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async getAll(
    filters: Record<string, string|number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IUser[]>> {
    let serviceResponse: IServiceResponse<IUser[]> = {};
    try {
      const result: IPagingResponse<IUser[]> = await getAllUsers(
        filters,
        paging,
        this.dataRepository
      );
      serviceResponse = { ...result };
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    // console.log(serviceResponse);
    return serviceResponse;
  }

  public async updatePassword(
    id: string,
    data: RequestUpdatePassword
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      canNotBeEmpty('password', data.password);
      mustBePassword('password', data.password);

      const newData = { ...data };
      const { hash, salt } = await this.services.passwordCryptoService.hash(data.password);
      newData.password = hash;
      newData.salt = salt;
      const user = await updatePassword(id, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return new ServiceResponse(serviceResponse);
  }

  public async createDocument(
    id: string,
    data: RequestCreateDocument
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await createDocument(id, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async updateDocument(
    userId: string,
    documentId: string,
    data: RequestUpdateDocument
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await updateDocument(userId, documentId, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async deleteDocument(
    userId: string,
    documentId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await deleteDocument(userId, documentId, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async createPhone(
    id: string,
    data: RequestCreatePhone
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await createPhone(id, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async updatePhone(
    userId: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await updatePhone(userId, phoneId, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async deletePhone(
    userId: string,
    phoneId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await deletePhone(userId, phoneId, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async createEmail(
    id: string,
    data: RequestCreateEmail
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await createEmail(id, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async updateEmail(
    userId: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await updateEmail(userId, emailId, data, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async deleteEmail(
    userId: string,
    emailId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await deleteEmail(userId, emailId, this.dataRepository);
      serviceResponse.result = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public static compile(config: IUserServiceConfig) {
    if (userService) return userService;
    userService = new UserService(config);
    return userService as BaseService<IUser, RequestCreateUser, RequestUpdateUser>;
  }
}
