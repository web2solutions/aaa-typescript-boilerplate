import {
  IAuthService
} from '@src/infra/auth/IAuthService';
import {
  IDbClient
} from '@src/infra/persistence/port/IDbClient';
import {
  Security
} from '@src/infra/security';
import {
  throwIfOASInputValidationFails,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import {
  IController
} from '@src/infra/server/HTTP/ports/IController';
import {
  IControllerFactory
} from '@src/infra/server/HTTP/ports/IControllerFactory';
import {
  Authorize
} from '@src/infra/server/HTTP/adapters/guard/Authorize';
import {
  BaseDomainEvent
} from '@src/domains/events/BaseDomainEvent';
import {
  IServiceResponse
} from '@src/domains/ports/IServiceResponse';
import {
  IUser,
  RequestCreateDocument,
  RequestCreateUser,
  RequestUpdateUser,
  UserDataRepository,
  UserService
} from '@src/domains/Users';
import { _INFRA_NOT_IMPLEMENTED_ } from '@src/infra/config/constants';
// import { BaseService } from '@src/domains/ports/BaseService';

let userController: any;

export class UserController implements IController {
  public authService: IAuthService;

  private userService: UserService;

  public openApiSpecification: any;

  public dbClient: IDbClient;

  constructor(factory: IControllerFactory) {
    this.authService = factory.authService || {};
    if (!this.authService.authenticate) {
      const error = new Error('AuthService is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this.openApiSpecification = factory.openApiSpecification;
    this.dbClient = factory.dbClient;
    this.userService = UserService.compile({
      repos: {
        UserDataRepository: UserDataRepository.compile({ dbClient: this.dbClient })
      }
    });
  }

  @Authorize()
  public async create(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    const requestCreateUser = event.input as RequestCreateUser;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestCreateUser
    );
    const { ok, error } = await this.userService.create(requestCreateUser);
    return { ok, error };
  }

  @Authorize()
  public async update(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestUpdateUser = event.input as RequestUpdateUser;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestUpdateUser
    );
    const userId = Security.xss(event.params.id);
    const { ok, error } = await this.userService.update(userId, requestUpdateUser);
    return { ok, error };
  }

  @Authorize()
  public async delete(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const { ok, error } = await this.userService.delete(userId);
    return { ok, error };
  }

  @Authorize()
  public async getOneById(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const { ok, error } = await this.userService.getOneById(userId);
    return { ok, error };
  }

  @Authorize()
  public async getAll(/* event: BaseDomainEvent */): Promise<IServiceResponse<IUser[]>> {
    // validateRequestParams(event.schemaOAS, event.params);
    // const page = parseInt(Security.xss(event.params.page || 0), 2);
    const { ok, error } = await this.userService.getAll();
    return { ok, error };
  }

  @Authorize()
  public async createDocument(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestCreateDocument = event.input as RequestCreateDocument;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestCreateDocument
    );
    const userId = Security.xss(event.params.id);
    const { ok, error } = await this.userService.createDocument(userId, requestCreateDocument);
    return { ok, error };
  }

  public static compile(factory: IControllerFactory) {
    if (userController) return userController;
    userController = new UserController(factory);
    return userController as UserController;
  }
}
