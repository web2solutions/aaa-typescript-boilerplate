import { _VALIDATION_ERROR_NAME_ } from '@src/infra/config/constants';
import { IController, IControllerFactory } from '@src/infra/server/HTTP/ports';
import { BaseController } from '@src/infra/server/HTTP/adapters/controllers/BaseController';
import {
  throwIfOASInputValidationFails,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
// import { Security } from '@src/infra/security';

import { BaseDomainEvent } from '@src/domains/events/BaseDomainEvent';
import { IServiceResponse } from '@src/domains/ports/IServiceResponse';

import { EAuthSchemaType } from '@src/infra/auth/EAuthSchemaType';
import { Authorize } from '@src/infra/server/HTTP/adapters/guard/Authorize';
import { IAuthorizationHeader } from '@src/infra/auth/IAuthorizationHeader';
import { ILogoutRequest } from '@src/infra/auth/dto/ILogoutRequest';
import { ILoginRequest } from '@src/infra/auth/dto/ILoginRequest';
import { IUpdatePasswordRequest } from '@src/infra/auth/dto/IUpdatePasswordRequest';
import { IRegisterRequest } from '@src/infra/auth/dto/IRegisterRequest';

let authController: any;

export class AuthController extends BaseController implements IController {
  // eslint-disable-next-line no-useless-constructor
  constructor(factory: IControllerFactory) {
    super(factory);
    //
  }

  public async login(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IAuthorizationHeader>> {
    validateRequestParams(event.schemaOAS, event.params);
    const loginRequest = event.input as ILoginRequest;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      loginRequest
    );
    const { username, password, schemaType } = loginRequest;

    const { result, error } = await this.authService
      .authenticate(username, password, schemaType ?? EAuthSchemaType.Bearer);

    return { result, error };
  }

  public async register(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<Record<string, any>>> {
    const registerRequest = event.input as IRegisterRequest;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      registerRequest
    );

    const { result, error } = await this.authService
      .register(registerRequest);

    return { result, error };
  }

  @Authorize()
  public async updatePassword(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = { result: false };
    let userId;
    try {
      const updatePasswordRequest = event.input as IUpdatePasswordRequest;
      throwIfOASInputValidationFails(
        this.openApiSpecification,
        event.schemaOAS,
        updatePasswordRequest
      );
      // const userId = Security.xss(event.params.id);

      const decodedToken = await this.authService.decodeToken(event.authorization);
      if (!decodedToken) {
        // 401
        const error = new Error('Invalid request');
        error.name = _VALIDATION_ERROR_NAME_;
        throw error;
      }

      userId = decodedToken.id;

      const lockUserId = await this.mutexService.lock('user', userId);
      if (lockUserId?.result.wasAlreadyLocked) {
        throw new Error('user locked');
      }

      const response = await this.authService.updatePassword(
        userId,
        updatePasswordRequest.password
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
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  @Authorize()
  public async logout(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = { result: false };
    try {
      const logoutRequest = event.input as ILogoutRequest;
      throwIfOASInputValidationFails(
        this.openApiSpecification,
        event.schemaOAS,
        logoutRequest
      );
      // const userId = Security.xss(event.params.id);

      const decodedToken = await this.authService.decodeToken(event.authorization);

      if (decodedToken!.username !== logoutRequest.username) {
        // 401
        const error = new Error('Invalid request');
        error.name = _VALIDATION_ERROR_NAME_;
        throw error;
      }

      const logoutResponse = await this.authService
        .logout();
      if (logoutResponse.error) {
        throw logoutResponse.error;
      }
      serviceResponse.result = logoutResponse.result;
    } catch (error) {
      serviceResponse.error = error as Error;
    }
    return serviceResponse;
  }

  public static compile(factory: IControllerFactory) {
    if (authController) return authController;
    authController = new AuthController(factory);
    return authController as AuthController;
  }
}
