import { IAuthUseCases } from '@src/modules/Users/application/ports/IAuthUseCases';
import { EAuthSchemaType } from '@src/modules/Users/service/ports/EAuthSchemaType';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IServiceResponse } from '@src/modules/port/IServiceResponse';
import { IAuthorizationHeader } from '@src/modules/Users/service/ports/IAuthorizationHeader';
import { ILoginRequest } from '@src/modules/Users/interface/dto/ILoginRequest';
import { IRegisterRequest } from '@src/modules/Users/interface/dto/IRegisterRequest';
import { IUpdatePasswordRequest } from '@src/modules/Users/interface/dto/IUpdatePasswordRequest';
import { ILogoutRequest } from '@src/modules/Users/interface/dto/ILogoutRequest';
import { BaseError, ResourceLockedError, ValidationError } from '@src/infra/exceptions';

export class AuthUseCases implements IAuthUseCases {
  private readonly authService: IAuthService;

  private readonly mutexService: IMutexService;

  constructor(
    authService: IAuthService,
    mutexService: IMutexService
  ) {
    this.authService = authService;
    this.mutexService = mutexService;
  }

  public async login(data: ILoginRequest): Promise<IServiceResponse<IAuthorizationHeader>> {
    const { username, password, schemaType } = data;
    return this.authService.authenticate(
      username,
      password,
      schemaType ?? EAuthSchemaType.Bearer
    );
  }

  public async register(data: IRegisterRequest): Promise<IServiceResponse<Record<string, any>>> {
    return this.authService.register(data);
  }

  public async updatePassword(
    authorization: string,
    data: IUpdatePasswordRequest
  ): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = { result: false };
    let userId;
    try {
      const decodedToken = await this.authService.decodeToken(authorization);
      if (!decodedToken) {
        throw new ValidationError('Invalid request');
      }

      userId = decodedToken.id;

      const lockUserId = await this.mutexService.lock('user', userId);
      if (lockUserId?.result.previouslyLocked) {
        throw new ResourceLockedError('user locked');
      }

      const response = await this.authService.updatePassword(
        userId,
        data.password
      );
      await this.mutexService.unlock('user', userId);

      if (response.error) {
        throw response.error;
      }
      serviceResponse.result = response.result;
    } catch (error) {
      if (userId) {
        await this.mutexService.unlock('user', userId);
      }
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async logout(
    authorization: string,
    data: ILogoutRequest
  ): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = { result: false };
    try {
      const decodedToken = await this.authService.decodeToken(authorization);

      if (decodedToken!.username !== data.username) {
        throw new ValidationError('Invalid request');
      }

      const logoutResponse = await this.authService.logout();
      if (logoutResponse.error) {
        throw logoutResponse.error;
      }
      serviceResponse.result = logoutResponse.result;
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public static compile(authService: IAuthService, mutexService: IMutexService): IAuthUseCases {
    return new AuthUseCases(authService, mutexService);
  }
}
