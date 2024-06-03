/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
import users from '@seed/users';
import { IUser } from '@src/domains/Users';

import { IAuthService } from './IAuthService';
import { IAuthSchema } from './IAuthSchema';
import { EAuthSchemaType } from './EAuthSchemaType';
import { _UNAUTHORIZED_ERROR_NAME_ } from '../config/constants';

let authService: IAuthService;

export class AuthService implements IAuthService {
  constructor() {
    // console.log('start auth service');
  }

  public async start() {
    //
  }

  public async stop() {
    //
  }

  private async findUser(username: string, password: string) {
    let userFound;
    for (const user of users) {
      if (user.username === username) {
        userFound = user;
        break;
      }
    }
    if (!userFound) {
      const error = new Error('user not found');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    if (userFound.password !== password) {
      const error = new Error('invalid password');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    return userFound;
  }

  private async basicAuth(authRequest: IAuthSchema) {
    const [username, password] = Buffer.from(authRequest.token, 'base64').toString().split(':');
    const userFound = await this.findUser(username, password);
    return userFound;
  }

  private async bearerAuth(authRequest: IAuthSchema): Promise<IUser> {
    console.log(authRequest);
    return {} as IUser;
  }

  public async authenticate(
    username: string,
    password: string,
    schemaType: EAuthSchemaType
  ): Promise<any> {
    await this.findUser(username, password);
    let token: string;
    const AuthorizationHeader = {
      Authorization: ''
    };
    if (schemaType === EAuthSchemaType.Basic) {
      token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
    } else {
      token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
    }
    AuthorizationHeader.Authorization = `${schemaType} ${token}`;
    return AuthorizationHeader;
  }

  public async authorizeBasedInTokenType(authRequest: IAuthSchema): Promise<IUser> {
    let userFound: IUser;
    if (authRequest.type === EAuthSchemaType.Basic) {
      userFound = await this.basicAuth(authRequest);
    } else {
      userFound = await this.bearerAuth(authRequest);
    }
    return userFound as IUser;
  }

  /* public async authorize(request: any, identity: IAuthSchema): Promise<IUser> {
    const AuthorizationHeader = (request.headers.authorization ?? '');
    const authArray = AuthorizationHeader.split(' ');
    const [autMechanism, token] = authArray;
    const authRequest: IAuthSchema = {
      type: autMechanism,
      token
    };
    // IAuthSchema
    // if (AuthorizationHeader.indexOf('basic'))
    const userFound = await this.authorizeBasedInTokenType(authRequest);
    return userFound;
  } */

  public async authorize(AuthorizationHeader: string = ''): Promise<IUser> {
    // const AuthorizationHeader = (request.headers.authorization ?? '');
    const authArray = AuthorizationHeader.split(' ');
    const [autMechanism, token] = authArray;
    const authRequest: IAuthSchema = {
      type: autMechanism as EAuthSchemaType,
      token
    };
    // IAuthSchema
    // if (AuthorizationHeader.indexOf('basic'))
    const userFound = await this.authorizeBasedInTokenType(authRequest);
    return userFound;
  }

  public async updatePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    console.log({
      username,
      oldPassword,
      newPassword
    });
    return true;
  }

  public async logout() {
    //
  }

  public throwIfUserHasNoAccessToResource(
    user: IUser,
    endPointConfig: Record<string, any>
  ) {
    const authName = Object.keys(endPointConfig.security[0])[0];
    // if end point has an auth schema
    if (authName) {
      const routePermission: string[] = endPointConfig.security[0][authName];
      // if route has any required permission
      if (routePermission.length > 0) {
        for (const permission of routePermission) {
          if (user.roles.indexOf(permission) === -1) {
            const error = new Error(`Insufficient permission - user must have the ${permission} role`);
            error.name = 'forbidden';
            throw error;
          }
        }
      }
    }
    return true;
  }

  public static compile() {
    if (authService) return authService;
    authService = new AuthService();
    return authService as IAuthService;
  }
}
