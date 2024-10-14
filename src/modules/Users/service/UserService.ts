// file deepcode ignore WrongNumberOfArguments: <same name but different functions>
// file deepcode ignore MissingArgument: <same name but different functions>

import {
  IPagingRequest, IPagingResponse, ServiceResponse, IServiceResponse, IServiceConfig, BaseService
} from '@src/modules/port';

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
} from '@src/modules/Users';

import { canNotBeEmpty, mustBePassword } from '@src/shared/validators';

import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';

import { BaseError, ResourceLockedError } from '@src/infra/exceptions';

interface IUserServiceConfig extends IServiceConfig {

}

let userService: any;

export class UserService extends BaseService<IUser, RequestCreateUser, RequestUpdateUser> {
  public dataRepository: UserDataRepository;

  private entityName = 'User';

  private mutexService: IMutexService;

  private passwordCryptoService: IPasswordCryptoService;

  public constructor(
    config: IUserServiceConfig
  ) {
    super(config);
    const { dataRepository, services } = config;
    this.dataRepository = dataRepository as UserDataRepository;
    this.passwordCryptoService = services!.passwordCryptoService;
    // this.services.mutexService = services!.mutexService;
    this.mutexService = services!.mutexService;
  }

  public async create(data: RequestCreateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const password = data.password || '';
      mustBePassword('password', password);

      const newData = { ...data };
      const { hash, salt } = await this.passwordCryptoService.hash(password);
      newData.password = hash;
      newData.salt = salt;

      serviceResponse.result = await createUser((newData ?? {}), this.dataRepository);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  // eslint-disable-next-line class-methods-use-this
  public async update(id: string, data: RequestUpdateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);
      // console.log('data', data);
      const user = await updateUser(id, data, this.dataRepository);
      // console.log('user', user)
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;
      // console.log(error);
      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const deleted = await deleteUserById(id, this.dataRepository);
      serviceResponse.result = deleted;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async getOneById(id: string): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      serviceResponse.result = await getUserById(id, this.dataRepository);
    } catch (error) {
      serviceResponse.error = error as BaseError;
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
      serviceResponse.error = error as BaseError;
    }
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

      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const newData = { ...data };
      const { hash, salt } = await this.passwordCryptoService.hash(data.password);
      newData.password = hash;
      newData.salt = salt;
      const user = await updatePassword(id, newData, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return new ServiceResponse(serviceResponse);
  }

  public async createDocument(
    id: string,
    data: RequestCreateDocument
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await createDocument(id, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;
      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async updateDocument(
    id: string,
    documentId: string,
    data: RequestUpdateDocument
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await updateDocument(id, documentId, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async deleteDocument(
    id: string,
    documentId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await deleteDocument(id, documentId, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async createPhone(
    id: string,
    data: RequestCreatePhone
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await createPhone(id, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async updatePhone(
    id: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await updatePhone(id, phoneId, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async deletePhone(
    id: string,
    phoneId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await deletePhone(id, phoneId, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async createEmail(
    id: string,
    data: RequestCreateEmail
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await createEmail(id, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async updateEmail(
    id: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await updateEmail(id, emailId, data, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public async deleteEmail(
    id: string,
    emailId: string
  ): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const { result: { previouslyLocked } } = await this.mutexService.lock(this.entityName, id);
      if (previouslyLocked) throw new ResourceLockedError(`${this.entityName} ${id} is locked`);

      const user = await deleteEmail(id, emailId, this.dataRepository);
      serviceResponse.result = user;

      await this.mutexService.unlock(this.entityName, id);
    } catch (error) {
      serviceResponse.error = error as BaseError;

      await this.mutexService.unlock(this.entityName, id);
    }
    return serviceResponse;
  }

  public static compile(config: IUserServiceConfig) {
    if (userService) return userService;
    userService = new UserService(config);
    return userService as BaseService<IUser, RequestCreateUser, RequestUpdateUser>;
  }
}
