/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
import { IUser } from '@src/modules/Users/domain/Entity/IUser';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';
import { IAuthorizationHeader } from '@src/modules/Users/service/ports/IAuthorizationHeader';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { IAuthSchema } from '@src/modules/Users/service/ports/IAuthSchema';
import { IUserProvider } from '@src/modules/Users/service/ports/IUserProvider';
import { ITokenObject } from '@src/modules/Users/service/ports/ITokenObject';

import { IJwtService } from '@src/infra/jwt/IJwtService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';
import { IKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/IKeyValueStorageClient';
import { ISecurityAuditRepository } from '@src/infra/audit';
import {
  BaseError, ForbiddenError, ResourceLockedError, UnauthorizedError, ValidationError
} from '@src/infra/exceptions/';

import { EEmailType, EmailValueObject } from '@src/modules/ddd/valueObjects';
import {
  EUserRole,
  hasSuperadminRole,
  shouldRequireOrganization,
  userCanAccessScope
} from '@src/modules/Users/domain/security/Rbac';

import { IServiceResponse } from '@src/modules/port';
import { IEventBus } from '@src/modules/port/IEventBus';
import { UUID } from '@src/modules/port/UUID';

const tokenKeys = [
  'id',
  'username',
  'firstName',
  'avatar',
  'organization',
  'roles'
];

export class AuthService implements IAuthService {
  // eslint-disable-next-line no-useless-constructor
  constructor(
    private readonly userProvider: IUserProvider,
    private readonly passwordCryptoService: IPasswordCryptoService,
    public readonly jwtService: IJwtService,
    private readonly keyValueStorageClient?: IKeyValueStorageClient,
    private readonly eventBus?: IEventBus,
    private readonly securityAuditRepository?: ISecurityAuditRepository
  ) {
    // console.log('start auth service');
  }

  public async start() {
    //
  }

  public async stop() {
    //
  }

  private get basicAuthEnabled(): boolean {
    const rawValue = String(process.env.AAA_ENABLE_BASIC_AUTH || '').trim().toLowerCase();
    if (!rawValue) return true;
    return rawValue === 'yes';
  }

  private get maxLoginAttempts(): number {
    return Number(process.env.AAA_AUTH_MAX_LOGIN_ATTEMPTS || 5);
  }

  private get loginWindowSeconds(): number {
    return Number(process.env.AAA_AUTH_LOGIN_WINDOW_SECONDS || 300);
  }

  private get lockoutSeconds(): number {
    return Number(process.env.AAA_AUTH_LOCKOUT_SECONDS || 900);
  }

  private get revocationPrefix(): string {
    return 'auth:revoked';
  }

  private get failuresPrefix(): string {
    return 'auth:failures';
  }

  private get lockPrefix(): string {
    return 'auth:locked';
  }

  private async getKeyWithExpiration<T = any>(key: string): Promise<T | null> {
    if (!this.keyValueStorageClient) return null;
    const { result } = await this.keyValueStorageClient.get(key);
    if (!result) return null;
    if (result?.expiresAt && Number(result.expiresAt) < Date.now()) {
      await this.keyValueStorageClient.del(key);
      return null;
    }
    return result as T;
  }

  private async setKeyWithExpiration(
    key: string,
    value: Record<string, any>,
    expiresInSeconds: number
  ): Promise<void> {
    if (!this.keyValueStorageClient) return;
    await this.keyValueStorageClient.set(key, {
      ...value,
      expiresAt: Date.now() + (expiresInSeconds * 1000)
    });
  }

  private async assertUserNotLocked(username: string): Promise<void> {
    const lock = await this.getKeyWithExpiration(`${this.lockPrefix}:${username}`);
    if (lock) {
      throw new ResourceLockedError('authentication temporarily locked');
    }
  }

  private async markFailedLogin(username: string): Promise<void> {
    if (!this.keyValueStorageClient) return;
    const key = `${this.failuresPrefix}:${username}`;
    const current = await this.getKeyWithExpiration<{ count: number }>(key);
    const count = Number(current?.count || 0) + 1;
    await this.setKeyWithExpiration(
      key,
      { count },
      this.loginWindowSeconds
    );
    if (count >= this.maxLoginAttempts) {
      await this.setKeyWithExpiration(
        `${this.lockPrefix}:${username}`,
        { count },
        this.lockoutSeconds
      );
    }
  }

  private async clearFailedLogin(username: string): Promise<void> {
    if (!this.keyValueStorageClient) return;
    await this.keyValueStorageClient.del(`${this.failuresPrefix}:${username}`);
    await this.keyValueStorageClient.del(`${this.lockPrefix}:${username}`);
  }

  private async assertTokenNotRevoked(decodedToken: ITokenObject): Promise<void> {
    const tokenId = String((decodedToken as any).jti || '');
    if (!tokenId) return;
    const revoked = await this.getKeyWithExpiration(`${this.revocationPrefix}:${tokenId}`);
    if (revoked) {
      throw new UnauthorizedError('invalid token');
    }
  }

  private async publishAuditEvent(
    name: string,
    payload: Record<string, unknown>,
    outcome: 'success' | 'failed' | 'denied' = 'success'
  ): Promise<void> {
    const occurredAt = new Date().toISOString();
    if (this.eventBus?.publish) {
      try {
        await this.eventBus.publish({
          name,
          payload,
          occurredAt
        });
      } catch (error) {
        //
      }
    }
    if (this.securityAuditRepository?.record) {
      try {
        await this.securityAuditRepository.record({
          id: UUID.create().toString(),
          name,
          outcome,
          payload,
          occurredAt
        });
      } catch (error) {
        //
      }
    }
  }

  private async findUser(username: string) {
    const userFound = await this.userProvider.findUser(username);
    if (!userFound) {
      throw new UnauthorizedError('user not found');
    }
    return userFound;
  }

  private async basicAuth(authRequest: IAuthSchema): Promise<ITokenObject> {
    if (!this.basicAuthEnabled) {
      throw new UnauthorizedError('invalid schema');
    }
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
    await this.assertTokenNotRevoked(decodedToken);
    return decodedToken;
  }

  public async decodeToken(AuthorizationHeader: string): Promise<ITokenObject | null> {
    const authArray = AuthorizationHeader.split(' ');
    const [schema, token] = authArray;
    if (schema === EAuthSchemaType.Bearer) {
      const decoded = this.jwtService.decodeToken(token) || null;
      if (!decoded) return null;
      await this.assertTokenNotRevoked(decoded);
      return decoded;
    }

    if (!this.basicAuthEnabled) {
      return null;
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
    const expectedSchema = this.basicAuthEnabled && schema === EAuthSchemaType.Basic
      ? EAuthSchemaType.Basic
      : EAuthSchemaType.Bearer;
    try {
      await this.assertUserNotLocked(username);
      // mustBePassword('password', password); // this kind of validation is a security flag
      const userFound = await this.findUser(username);
      const passwordMatch = await this.passwordCryptoService.compare(password, userFound.password);
      if (!passwordMatch) {
        throw new UnauthorizedError('password does not matches');
      }
      await this.clearFailedLogin(username);
      await this.publishAuditEvent('users.auth.login.success', { username }, 'success');
      let token: string;
      const AuthorizationHeader = {
        Authorization: ''
      };
      if (expectedSchema === EAuthSchemaType.Basic) {
        token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
      } else {
        token = this.jwtService.generateToken(userFound);
      }
      AuthorizationHeader.Authorization = `${expectedSchema} ${token}`;
      serviceResponse.result = AuthorizationHeader;
    } catch (error) {
      if (error instanceof ResourceLockedError) {
        await this.publishAuditEvent('users.auth.login.blocked', { username }, 'denied');
        serviceResponse.error = error;
      } else {
        await this.markFailedLogin(username);
        await this.publishAuditEvent('users.auth.login.failed', { username }, 'failed');
        if (String(process.env.NODE_ENV || '').toLowerCase() === 'prod'
          || String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
          serviceResponse.error = new UnauthorizedError('invalid credentials');
        } else {
          serviceResponse.error = error as BaseError;
        }
      }
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
    if (schema === EAuthSchemaType.Basic && !this.basicAuthEnabled) {
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

  public async logout(authorization: string = ''): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {
      result: true
    };
    try {
      if (!authorization) {
        return serviceResponse;
      }
      const decodedToken = await this.decodeToken(authorization);
      if (!decodedToken) {
        throw new UnauthorizedError('invalid token');
      }
      const tokenId = String((decodedToken as any).jti || '');
      const tokenExpiration = Number((decodedToken as any).exp || 0);
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(0, tokenExpiration - nowInSeconds);
      if (tokenId && remainingSeconds > 0) {
        await this.setKeyWithExpiration(
          `${this.revocationPrefix}:${tokenId}`,
          { revoked: true },
          remainingSeconds
        );
      }
      await this.publishAuditEvent('users.auth.logout.success', {
        userId: decodedToken.id,
        username: decodedToken.username
      }, 'success');
    } catch (error) {
      await this.publishAuditEvent('users.auth.logout.failed', {}, 'failed');
      serviceResponse.error = error as BaseError;
      serviceResponse.result = false;
    }
    return Promise.resolve(serviceResponse);
  }

  public async register(data: Record<string, any>): Promise<IServiceResponse<Record<string, any>>> {
    // eslint-disable-next-line no-param-reassign
    const { roles: incomingRoles, organization, username } = data;
    let roles = incomingRoles;
    if (!roles || roles.length === 0) {
      roles = organization ? [EUserRole.user] : ['access_allow'];
    }
    const record = {
      ...data,
      // set default email
      emails: [{
        email: username,
        type: EEmailType.work,
        isPrimary: true
      } as EmailValueObject],
      roles
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
    const routePermission = endPointConfig?.security?.[0]
      ? Object.values(endPointConfig.security[0])[0] as string[]
      : [];
    const auditPayload = {
      userId: user?.id || '',
      username: user?.username || '',
      permissions: routePermission || []
    };
    if (!endPointConfig.security) {
      this.publishAuditEvent('users.authz.scope.denied', {
        ...auditPayload,
        reason: 'missing_route_security'
      }, 'denied').catch(() => {});
      throw new ValidationError('The route Controller is secured by guard rails but there is no security schema defined in the Open API specification file.invalid schema');
    }
    const authName = Object.keys(endPointConfig.security[0])[0];
    // if end point has an auth schema
    if (authName) {
      const routePermission: string[] = endPointConfig.security[0][authName];
      // if route has any required permission
      if (!user.roles) {
        this.publishAuditEvent('users.authz.scope.denied', {
          ...auditPayload,
          reason: 'missing_user_roles'
        }, 'denied').catch(() => {});
        throw new ForbiddenError('Insufficient permission - invalid user - user.roles is missing');
      }
      if (shouldRequireOrganization(user.roles) && !user.organization) {
        this.publishAuditEvent('users.authz.scope.denied', {
          ...auditPayload,
          reason: 'missing_organization_for_role'
        }, 'denied').catch(() => {});
        throw new ForbiddenError('Insufficient permission - organization is required for this user role');
      }
      if (hasSuperadminRole(user.roles)) {
        this.publishAuditEvent('users.authz.scope.allowed', {
          ...auditPayload,
          reason: 'superadmin_bypass'
        }, 'success').catch(() => {});
        return true;
      }
      if (routePermission.length > 0) {
        for (const permission of routePermission) {
          if (!userCanAccessScope(user.roles, permission)) {
            this.publishAuditEvent('users.authz.scope.denied', {
              ...auditPayload,
              reason: `missing_scope_${permission}`
            }, 'denied').catch(() => {});
            throw new ForbiddenError(`Insufficient permission - user must have the ${permission} role`);
          }
        }
        this.publishAuditEvent('users.authz.scope.allowed', {
          ...auditPayload,
          reason: 'all_scopes_validated'
        }, 'success').catch(() => {});
      }
    }
    return true;
  }

  public static compile(
    userProvider: IUserProvider,
    passwordCryptoService: IPasswordCryptoService,
    jwtService: IJwtService,
    keyValueStorageClient?: IKeyValueStorageClient,
    eventBus?: IEventBus,
    securityAuditRepository?: ISecurityAuditRepository
  ): IAuthService {
    return new AuthService(
      userProvider,
      passwordCryptoService,
      jwtService,
      keyValueStorageClient,
      eventBus,
      securityAuditRepository
    );
  }
}
