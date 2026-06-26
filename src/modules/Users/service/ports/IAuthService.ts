import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { IServiceResponse } from '@src/modules/port';
import { IJwtService } from '@src/infra/jwt/IJwtService';

import { EAuthSchemaType } from './EAuthSchemaType';
import { IAuthorizationHeader } from './IAuthorizationHeader';
import { ITokenObject } from './ITokenObject';

export interface IAuthService {
  start(): Promise<void>;
  stop(): Promise<void>;
  jwtService: IJwtService;
  register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  updateUser(id: string, data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>>;
  deleteUser(id: string): Promise<IServiceResponse<boolean>>;
  decodeToken(token: string): Promise<ITokenObject | null>;
  authenticate(
    username: string,
    password: string,
    schemaType: EAuthSchemaType
  ): Promise<IServiceResponse<IAuthorizationHeader>>;
  // authorize(/* identity: IAuthSchema */ request: any): Promise<any>;
  authorize(/* identity: IAuthSchema */ header: string): Promise<ITokenObject>;
  updatePassword(
    id: string,
    // oldPassword: string,
    newPassword: string
  ): Promise<IServiceResponse<boolean>>;
  logout(): Promise<IServiceResponse<boolean>>;
  throwIfUserHasNoAccessToResource(
    user: IUser,
    endPointConfig: Record<string, any>
  ): boolean;
  compile?(): IAuthService;
}
