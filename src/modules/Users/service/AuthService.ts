/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
import {
  IUser,
  EAuthSchemaType,
  IAuthorizationHeader,
  IAuthService,
  IAuthSchema,
  IUserProvider,
  ITokenObject
} from '@src/modules/Users';

import { IJwtService } from '@src/infra/jwt/IJwtService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import {
  BaseError, ForbiddenError, UnauthorizedError, ValidationError
} from '@src/infra/exceptions/';

import { EEmailType, EmailValueObject } from '@src/modules/ddd/valueObjects';

import { IServiceResponse } from '@src/modules/port';

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
    private readonly userProvider: IUserProvider,
    private readonly passwordCryptoService: IPasswordCryptoService,
    public readonly jwtService: IJwtService
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
      throw new UnauthorizedError('user not found');
    }
    return userFound;
  }

  private async basicAuth(authRequest: IAuthSchema): Promise<ITokenObject> {
    const [username, password] = Buffer.from(authRequest.token, 'base64').toString().split(':');
    const userFound = await this.findUser(username);
    const passwordMatch = await this.passwordCryptoService.compare(password, userFound.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('invalid password');
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
      throw new UnauthorizedError('invalid token');
    }
    return decodedToken;
  }

  public async decodeToken(AuthorizationHeader: string): Promise<ITokenObject | null> {
    const authArray = AuthorizationHeader.split(' ');
    const [schema, token] = authArray;
    if (schema === EAuthSchemaType.Bearer) {
      return this.jwtService.decodeToken(token) || null;
    }

    const [username] = Buffer.from(token, 'base64').toString().split(':');
    const { id } = await this.findUser(username);
    if (!id) {
      return null;
    }
    // get id from db
    return { id, username } as ITokenObject;
  }

  public async authenticate(
    username: string,
    password: string,
    schema: EAuthSchemaType
  ): Promise<IServiceResponse<IAuthorizationHeader>> {
    const serviceResponse: IServiceResponse<IAuthorizationHeader> = {};
    try {
      // mustBePassword('password', password); // this kind of validation is a security flag
      const userFound = await this.findUser(username);
      const passwordMatch = await this.passwordCryptoService.compare(password, userFound.password);
      if (!passwordMatch) {
        throw new UnauthorizedError('password does not matches');
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
      serviceResponse.result = AuthorizationHeader;
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
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
      throw new UnauthorizedError('invalid token');
    }
    if (
      schema !== EAuthSchemaType.Basic
      && schema !== EAuthSchemaType.Bearer
    ) {
      throw new UnauthorizedError('invalid schema');
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
  ): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {};
    try {
      const { result: userFound } = await this.userProvider.updatePassword(id, newPassword);
      if (!userFound) {
        throw new UnauthorizedError('user not found');
      }
      serviceResponse.result = true;
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async logout(): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {
      result: true
    };
    return Promise.resolve(serviceResponse);
  }

  public async register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>> {
    // eslint-disable-next-line no-param-reassign
    const record = {
      ...data,
      // set default email
      emails: [{
        email: data.username,
        type: EEmailType.work,
        isPrimary: true
      } as EmailValueObject],
      roles: ['access_allow']
    };
    return this.userProvider.register(record);
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
    if (!endPointConfig.security) {
      throw new ValidationError('The route Controller is secured by guard rails but there is no security schema defined in the Open API specification file.invalid schema');
    }
    const authName = Object.keys(endPointConfig.security[0])[0];
    // if end point has an auth schema
    if (authName) {
      const routePermission: string[] = endPointConfig.security[0][authName];
      // if route has any required permission
      if (!user.roles) {
        throw new ForbiddenError('Insufficient permission - invalid user - user.roles is missing');
      }
      if (routePermission.length > 0) {
        for (const permission of routePermission) {
          if (user.roles.indexOf(permission) === -1) {
            throw new ForbiddenError(`Insufficient permission - user must have the ${permission} role`);
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
