import { BaseService } from '@src/domains/ports/BaseService';
import { ServiceError } from '@src/domains/ports/ServiceError';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { IServiceConfig, TRepos } from '@src/domains/ports/IServiceConfig';
import {
  User,
  UserDataRepository,
  createUser,
  updateUser,
  deleteUserById,
  getUserById,
  getAllUsers,
  RequestCreateUser,
  IUser
} from '..';
import { RequestUpdateUser } from '../ports/dto/RequestUpdateUser';

interface IUserServiceConfig extends IServiceConfig {

}
let userService: any;
export class UserService extends BaseService<IUser, User> {
  private repo: UserDataRepository;

  public repos: TRepos;

  private constructor(config: IUserServiceConfig) {
    super(config);
    const { repos } = config;
    this.repos = repos ?? {};
    this.repo = this.repos.UserDataRepository as UserDataRepository;
  }

  public async create(data: RequestCreateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const document = await createUser((data ?? {}), this.repo);
      serviceResponse.ok = document as IUser;
    } catch (error) {
      // console.log(error);
      serviceResponse.error = new ServiceError(error as Error);
    }
    // console.log(serviceResponse.error);
    return serviceResponse;
  }

  // eslint-disable-next-line class-methods-use-this
  public async update(id: string, data: RequestUpdateUser): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await updateUser(id, data, this.repo);
      serviceResponse.ok = user;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {};
    try {
      const deleted = await deleteUserById(id, this.repo);
      serviceResponse.ok = deleted;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async getOneById(id: string): Promise<IServiceResponse<IUser>> {
    const serviceResponse: IServiceResponse<IUser> = {};
    try {
      const user = await getUserById(id, this.repo);
      serviceResponse.ok = user as IUser;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public async getAll(): Promise<IServiceResponse<IUser[]>> {
    const serviceResponse: IServiceResponse<IUser[]> = {};
    try {
      const users = await getAllUsers(this.repo);
      serviceResponse.ok = users as IUser[];
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public static compile(config: IUserServiceConfig) {
    if (userService) return userService;
    userService = new UserService(config);
    return userService as BaseService<IUser, User>;
  }
}
