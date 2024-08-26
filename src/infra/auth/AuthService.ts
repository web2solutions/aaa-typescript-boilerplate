/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */

import { IUser } from '@src/domains/Users';
import { mustBePassword } from '@src/domains/validators';

import { IServiceResponse } from '@src/domains/ports/IServiceResponse';
import { _UNAUTHORIZED_ERROR_NAME_ } from '../config/constants';

import { IAuthService } from './IAuthService';
import { IAuthSchema } from './IAuthSchema';
import { EAuthSchemaType } from './EAuthSchemaType';
import { IUserProvider } from './IUserProvider';
import { IAuthorizationHeader } from './IAuthorizationHeader';
import { IPasswordCryptoService } from '../security/IPasswordCryptoService';
import { IJwtService } from '../jwt/IJwtService';
import { ITokenObject } from './ITokenObject';

const tokenKeys = [
  'id',
  'username',
  'firstName',
  'avatar',
  'roles'
];

let authService: IAuthService;

export class AuthService implements IAuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private userProvider: IUserProvider,
    private passwordCryptoService: IPasswordCryptoService,
    private jwtService: IJwtService
  ) {
    // console.log('start auth service');
  }

  public async start() {
    //
  }

  public async stop() {
    //
  }

  private async findUser(username: string) {
    const userFound = await this.userProvider.findUser(username);
    if (!userFound) {
      const error = new Error('user not found');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    return userFound;
  }

  private async basicAuth(authRequest: IAuthSchema): Promise<ITokenObject> {
    const [username, password] = Buffer.from(authRequest.token, 'base64').toString().split(':');
    const userFound = await this.findUser(username);
    const passwordMatch = await this.passwordCryptoService.compare(password, userFound.password);
    if (!passwordMatch) {
      const error = new Error('invalid password');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    const tokenObject: Record<string, any> = {};
    tokenKeys.forEach((key: string) => {
      tokenObject[key] = userFound[key];
    });
    return tokenObject as ITokenObject;
  }

  private async bearerAuth(authRequest: IAuthSchema): Promise<ITokenObject> {
    const decodedToken = this.jwtService.decodeToken(authRequest.token);
    if (!decodedToken) {
      const error = new Error('invalid token');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    return decodedToken as ITokenObject;
  }

  public async authenticate(
    username: string,
    password: string,
    schema: EAuthSchemaType
  ): Promise<IAuthorizationHeader> {
    mustBePassword('password', password);
    const userFound = await this.findUser(username);
    const passwordMatch = await this.passwordCryptoService.compare(password, userFound.password);
    if (!passwordMatch) {
      const error = new Error('password does not matches');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    let token: string;
    const AuthorizationHeader = {
      Authorization: ''
    };
    if (schema === EAuthSchemaType.Basic) {
      token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
    } else {
      token = this.jwtService.generateToken(userFound);
    }
    AuthorizationHeader.Authorization = `${schema} ${token}`;
    return AuthorizationHeader;
  }

  public async authorizeBasedInTokenType(authRequest: IAuthSchema): Promise<ITokenObject> {
    let userFound: ITokenObject;
    if (authRequest.type === EAuthSchemaType.Basic) {
      userFound = await this.basicAuth(authRequest);
    } else {
      userFound = await this.bearerAuth(authRequest);
    }
    return userFound;
  }

  public async authorize(AuthorizationHeader: string = ''): Promise<ITokenObject> {
    const authArray = AuthorizationHeader.split(' ');
    const [schema, token] = authArray;
    if (!token) {
      const error = new Error('invalid token');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    if (
      schema !== EAuthSchemaType.Basic
      && schema !== EAuthSchemaType.Bearer
    ) {
      const error = new Error('invalid schema');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    const authRequest: IAuthSchema = {
      type: schema as EAuthSchemaType,
      token
    };

    return this.authorizeBasedInTokenType(authRequest);
  }

  public async updatePassword(
    id: string,
    // oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const { result: userFound } = await this.userProvider.updatePassword(id, newPassword);
    if (!userFound) {
      const error = new Error('user not found');
      error.name = _UNAUTHORIZED_ERROR_NAME_;
      throw error;
    }
    return !!userFound;
  }

  public async logout() {
    //
  }

  public async register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>> {
    return this.userProvider.register(data);
  }

  public async updateUser(
    id: string,
    data: Record<string, any>
  ): Promise<IServiceResponse<Record<string, any>>> {
    return this.userProvider.update(id, data);
  }

  public async deleteUser(id: string): Promise<IServiceResponse<boolean>> {
    return this.userProvider.delete(id);
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
      if (!user.roles) {
        const error = new Error('Insufficient permission - invalid user - user.roles is missing');
        error.name = 'forbidden';
        throw error;
      }
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

  public static compile(
    userProvider: IUserProvider,
    passwordCryptoService: IPasswordCryptoService,
    jwtService: IJwtService
  ) {
    if (authService) return authService;
    authService = new AuthService(
      userProvider,
      passwordCryptoService,
      jwtService
    );
    return authService;
  }
}
