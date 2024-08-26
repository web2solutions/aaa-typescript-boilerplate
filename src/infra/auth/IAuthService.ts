import { IUser } from '@src/domains/Users';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';

import { EAuthSchemaType } from './EAuthSchemaType';
import { IAuthorizationHeader } from './IAuthorizationHeader';
import { ITokenObject } from './ITokenObject';

export interface IAuthService {
  start(): Promise<void>;
  stop(): Promise<void>;
  register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  updateUser(id: string, data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  deleteUser(id: string): Promise<IServiceResponse<boolean>>;
  authenticate(
    username: string,
    password: string,
    schemaType: EAuthSchemaType
  ): Promise<IAuthorizationHeader>;
  // authorize(/* identity: IAuthSchema */ request: any): Promise<any>;
  authorize(/* identity: IAuthSchema */ header: string): Promise<ITokenObject>;
  updatePassword(
    id: string,
    // oldPassword: string,
    newPassword: string
  ): Promise<boolean>;
  logout(): Promise<void>;
  throwIfUserHasNoAccessToResource(
    user: IUser,
    endPointConfig: Record<string, any>
  ): boolean;
  compile?(): IAuthService;
}
