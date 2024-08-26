import { IUser } from '@src/domains/Users';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';

export interface IUserProvider {
  register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  update(id: string, data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  delete(id: string): Promise<IServiceResponse<boolean>>;
  findUser(username: string): Promise<any>;
  updatePassword(id: string, newPassword: string): Promise<IServiceResponse<IUser>>;
}
