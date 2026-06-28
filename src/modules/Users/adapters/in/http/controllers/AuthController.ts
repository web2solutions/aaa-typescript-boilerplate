import { IController, IControllerFactory } from '@src/interface/HTTP/ports';
import { BaseController } from '@src/interface/HTTP/ports/BaseController';
import {
  validateRequestAgainstOAS
} from '@src/interface/HTTP/validators';
// import { Security } from '@src/infra/security';

import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { IServiceResponse } from '@src/modules/port';

import { Authorize } from '@src/shared/decorators/guard/Authorize';

import {
  EAuthSchemaType
} from '@src/modules/Users/service/ports/EAuthSchemaType';
import { IAuthorizationHeader } from '@src/modules/Users/service/ports/IAuthorizationHeader';
import { ILogoutRequest } from '@src/modules/Users/interface/dto/ILogoutRequest';
import { ILoginRequest } from '@src/modules/Users/interface/dto/ILoginRequest';
import { IUpdatePasswordRequest } from '@src/modules/Users/interface/dto/IUpdatePasswordRequest';
import { IRegisterRequest } from '@src/modules/Users/interface/dto/IRegisterRequest';
import { IAuthUseCases } from '@src/modules/Users/application/ports/IAuthUseCases';

export class AuthController extends BaseController implements IController {
  private readonly authUseCases: IAuthUseCases;

  // eslint-disable-next-line no-useless-constructor
  constructor(factory: IControllerFactory) {
    super(factory);
    if (!factory.authUseCases) {
      throw new Error('AuthUseCases is not implemented');
    }
    this.authUseCases = factory.authUseCases;
  }

  public async login(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IAuthorizationHeader>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const loginRequest = event.input as ILoginRequest;
    const { result, error } = await this.authUseCases.login({
      ...loginRequest,
      schemaType: loginRequest.schemaType ?? EAuthSchemaType.Bearer
    });

    return { result, error };
  }

  public async register(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<Record<string, any>>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const registerRequest = event.input as IRegisterRequest;

    const { result, error } = await this.authUseCases.register(registerRequest);

    return { result, error };
  }

  @Authorize()
  public async updatePassword(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const updatePasswordRequest = event.input as IUpdatePasswordRequest;
    return this.authUseCases.updatePassword(event.authorization, updatePasswordRequest);
  }

  @Authorize()
  public async logout(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const logoutRequest = event.input as ILogoutRequest;
    return this.authUseCases.logout(event.authorization, logoutRequest);
  }

  public static compile(factory: IControllerFactory) {
    return new AuthController(factory);
  }
}
