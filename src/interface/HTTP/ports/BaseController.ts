import { _INFRA_NOT_IMPLEMENTED_ } from '@src/config/constants';
import { IAuthService } from '@src/modules/Users/service/ports/IAuthService';
import { IControllerFactory } from '@src/interface/HTTP/ports/IControllerFactory';
import { IDatabaseClient } from '@src/infra/persistence/port/IDatabaseClient';
import { IMutexService } from '@src/infra/mutex/port/IMutexService';
import { IPasswordCryptoService } from '@src/infra/security/IPasswordCryptoService';

export abstract class BaseController {
  private _authService: IAuthService = {} as IAuthService;

  public _databaseClient: IDatabaseClient = {} as IDatabaseClient;

  private _passwordCryptoService: IPasswordCryptoService = {} as IPasswordCryptoService;

  private _mutexService: IMutexService = {} as IMutexService;

  public openApiSpecification: any;

  constructor(factory: IControllerFactory) {
    this.authService = factory.authService;

    this.databaseClient = factory.databaseClient;

    this.openApiSpecification = factory.openApiSpecification;

    if (factory.passwordCryptoService) {
      this.passwordCryptoService = factory.passwordCryptoService;
    }

    if (factory.mutexService) {
      this.mutexService = factory.mutexService;
    }
  }

  public get passwordCryptoService(): IPasswordCryptoService {
    return this._passwordCryptoService;
  }

  public set passwordCryptoService(service: IPasswordCryptoService) {
    if (!service.hash) {
      const error = new Error('PasswordCryptoService is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this._passwordCryptoService = service;
  }

  public get mutexService(): IMutexService {
    return this._mutexService;
  }

  public set mutexService(service: IMutexService) {
    if (!service.lock) {
      const error = new Error('MutexService is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this._mutexService = service;
  }

  public get authService() {
    return this._authService;
  }

  public set authService(service: IAuthService) {
    if (!service.authenticate) {
      const error = new Error('AuthService is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this._authService = service;
  }

  public get databaseClient() {
    return this._databaseClient;
  }

  public set databaseClient(service: IDatabaseClient) {
    if (!service.stores) {
      const error = new Error('DatabaseClient is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this._databaseClient = service;
  }
}
