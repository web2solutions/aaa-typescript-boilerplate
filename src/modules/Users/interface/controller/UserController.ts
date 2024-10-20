import { IController, IControllerFactory } from '@src/interface/HTTP/ports';
import { BaseController } from '@src/interface/HTTP/ports/BaseController';
import { Security } from '@src/infra/security';
import {
  throwIfOASInputValidationFails,
  validateRequestParams
} from '@src/interface/HTTP/validators';
import { Authorize } from '@src/shared/decorators/guard/Authorize';

import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import {
  IServiceResponse, setFilter, setPaging
} from '@src/modules/port';
import {
  IUser,
  RequestCreateDocument,
  RequestCreateEmail,
  RequestCreatePhone,
  RequestCreateUser,
  RequestUpdateDocument,
  RequestUpdateEmail,
  RequestUpdatePassword,
  RequestUpdatePhone,
  RequestUpdateUser,
  UserDataRepository,
  UserService
} from '@src/modules/Users';

let userController: any;

export class UserController extends BaseController implements IController {
  private readonly userService: UserService;

  constructor(factory: IControllerFactory) {
    super(factory);
    const dataRepository = UserDataRepository.compile({
      databaseClient: this.databaseClient
    });
    this.userService = UserService.compile({
      dataRepository,
      services: {
        passwordCryptoService: this.passwordCryptoService,
        mutexService: this.mutexService
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
    const { result, error } = await this.userService.create(requestCreateUser);
    return { result, error };
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
    const { result, error } = await this.userService.update(
      userId,
      requestUpdateUser
    );
    return { result, error };
  }

  @Authorize()
  public async updatePassword(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestUpdatePassword = event.input as RequestUpdatePassword;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestUpdatePassword
    );
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userService.updatePassword(
      userId,
      requestUpdatePassword
    );
    return { result, error };
  }

  @Authorize()
  public async delete(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userService.delete(userId);
    return { result, error };
  }

  @Authorize()
  public async getOneById(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userService.getOneById(userId);
    return { result, error };
  }

  @Authorize()
  public async getAll(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser[]>> {
    // validateRequestParams(event.schemaOAS, event.params);
    // const page = parseInt(Security.xss(event.params.page || 0), 2);
    const filters = setFilter(event);
    const paging = setPaging(event);
    const result = await this.userService.getAll(
      { ...filters },
      paging
    );
    // console.log(result);
    return result;
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
    const { result, error } = await this.userService.createDocument(
      userId,
      requestCreateDocument
    );
    return { result, error };
  }

  @Authorize()
  public async updateDocument(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestUpdateDocument = event.input as RequestUpdateDocument;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestUpdateDocument
    );
    const userId = Security.xss(event.params.id);
    const documentId = Security.xss(event.params.documentId);
    const { result, error } = await this.userService.updateDocument(
      userId,
      documentId,
      requestUpdateDocument
    );
    return { result, error };
  }

  @Authorize()
  public async deleteDocument(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const documentId = Security.xss(event.params.documentId);
    const { result, error } = await this.userService.deleteDocument(
      userId,
      documentId
    );
    return { result, error };
  }

  @Authorize()
  public async createPhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestCreatePhone = event.input as RequestCreatePhone;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestCreatePhone
    );
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userService.createPhone(
      userId,
      requestCreatePhone
    );
    return { result, error };
  }

  @Authorize()
  public async updatePhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestUpdatePhone = event.input as RequestUpdatePhone;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestUpdatePhone
    );
    const userId = Security.xss(event.params.id);
    const phoneId = Security.xss(event.params.phoneId);
    const { result, error } = await this.userService.updatePhone(
      userId,
      phoneId,
      requestUpdatePhone
    );
    return { result, error };
  }

  @Authorize()
  public async deletePhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const phoneId = Security.xss(event.params.phoneId);
    const { result, error } = await this.userService.deletePhone(
      userId,
      phoneId
    );
    return { result, error };
  }

  @Authorize()
  public async createEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestCreateEmail = event.input as RequestCreateEmail;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestCreateEmail
    );
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userService.createEmail(
      userId,
      requestCreateEmail
    );
    return { result, error };
  }

  @Authorize()
  public async updateEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const requestUpdateEmail = event.input as RequestUpdateEmail;
    throwIfOASInputValidationFails(
      this.openApiSpecification,
      event.schemaOAS,
      requestUpdateEmail
    );
    const userId = Security.xss(event.params.id);
    const emailId = Security.xss(event.params.emailId);
    const { result, error } = await this.userService.updateEmail(
      userId,
      emailId,
      requestUpdateEmail
    );
    return { result, error };
  }

  @Authorize()
  public async deleteEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestParams(event.schemaOAS, event.params);
    const userId = Security.xss(event.params.id);
    const emailId = Security.xss(event.params.emailId);
    const { result, error } = await this.userService.deleteEmail(
      userId,
      emailId
    );
    return { result, error };
  }

  public static compile(factory: IControllerFactory) {
    if (userController) return userController;
    userController = new UserController(factory);
    return userController as UserController;
  }
}
