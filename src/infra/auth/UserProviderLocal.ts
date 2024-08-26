/* eslint-disable class-methods-use-this */
import { IUserProvider } from '@src/infra/auth/IUserProvider';

import {
  IUser, RequestCreateUser, RequestUpdateUser, UserService
} from '@src/domains/Users';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';

let userProvider: IUserProvider;

export class UserProviderLocal implements IUserProvider {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>> {
    return this.userService.create(data as RequestCreateUser);
  }

  public async update(
    id: string,
    data: Record<string, any>
  ): Promise<IServiceResponse<Record<string, any>>> {
    return this.userService.update(id, data as RequestUpdateUser);
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    return this.userService.delete(id);
  }

  public async findUser(username: string): Promise<IUser | null> {
    const { result } = await this.userService.getAll({ username }, { page: 1, size: 1 });
    const userFound = result ? result[0] : null;
    return userFound;
  }

  public async updatePassword(id: string, newPassword: string): Promise<IServiceResponse<IUser>> {
    return this.userService.updatePassword(id, { password: newPassword });
  }

  public static compile(userService: UserService) {
    if (userProvider) return userProvider;
    userProvider = new UserProviderLocal(userService);
    return userProvider;
  }
}
