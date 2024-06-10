// import { IAuthSchema } from './IAuthSchema';
import { IUser } from '@src/domains/Users';
import { EAuthSchemaType } from './EAuthSchemaType';

export interface IAuthService {
  start(): Promise<void>;
  stop(): Promise<void>;
  authenticate(
    username: string,
    password: string,
    schemaType: EAuthSchemaType
  ): Promise<any>;
  // authorize(/* identity: IAuthSchema */ request: any): Promise<any>;
  authorize(/* identity: IAuthSchema */ header: string): Promise<any>;
  updatePassword(
    username: string,
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
