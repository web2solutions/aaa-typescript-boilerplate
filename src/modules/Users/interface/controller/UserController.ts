import { IController, IControllerFactory } from '@src/interface/HTTP/ports';
import { BaseController } from '@src/interface/HTTP/ports/BaseController';
import { Security } from '@src/infra/security';
import { _INFRA_NOT_IMPLEMENTED_ } from '@src/config/constants';
import {
  validateRequestAgainstOAS
} from '@src/interface/HTTP/validators';
import { Authorize } from '@src/shared/decorators/guard/Authorize';

import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import {
  IServiceResponse, setFilter, setPaging
} from '@src/modules/port';
import {
  IUser
} from '@src/modules/Users/domain/Entity/IUser';
import { RequestCreateDocument } from '@src/modules/Users/interface/dto/RequestCreateDocument';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestCreateUser } from '@src/modules/Users/interface/dto/RequestCreateUser';
import { RequestUpdateDocument } from '@src/modules/Users/interface/dto/RequestUpdateDocument';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdatePassword } from '@src/modules/Users/interface/dto/RequestUpdatePassword';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestUpdateUser } from '@src/modules/Users/interface/dto/RequestUpdateUser';
import { IUserUseCases } from '@src/modules/Users/application/ports/IUserUseCases';

export class UserController extends BaseController implements IController {
  private readonly userUseCases: IUserUseCases;

  constructor(factory: IControllerFactory) {
    super(factory);
    if (!factory.userUseCases) {
      const error = new Error('UserUseCases is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this.userUseCases = factory.userUseCases;
  }

  @Authorize()
  public async create(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestCreateUser = event.input as RequestCreateUser;
    const { result, error } = await this.userUseCases.create(requestCreateUser);
    return { result, error };
  }

  @Authorize()
  public async update(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestUpdateUser = event.input as RequestUpdateUser;
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.update(
      userId,
      requestUpdateUser
    );
    return { result, error };
  }

  @Authorize()
  public async updatePassword(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestUpdatePassword = event.input as RequestUpdatePassword;
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.updatePassword(
      userId,
      requestUpdatePassword
    );
    return { result, error };
  }

  @Authorize()
  public async delete(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.delete(userId);
    return { result, error };
  }

  @Authorize()
  public async getOneById(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.getOneById(userId);
    return { result, error };
  }

  @Authorize()
  public async getAll(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser[]>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const filters = setFilter(event);
    const paging = setPaging(event);
    const result = await this.userUseCases.getAll(
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
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestCreateDocument = event.input as RequestCreateDocument;
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.createDocument(
      userId,
      requestCreateDocument
    );
    return { result, error };
  }

  @Authorize()
  public async updateDocument(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestUpdateDocument = event.input as RequestUpdateDocument;
    const userId = Security.xss(event.params.id);
    const documentId = Security.xss(event.params.documentId);
    const { result, error } = await this.userUseCases.updateDocument(
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
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const userId = Security.xss(event.params.id);
    const documentId = Security.xss(event.params.documentId);
    const { result, error } = await this.userUseCases.deleteDocument(
      userId,
      documentId
    );
    return { result, error };
  }

  @Authorize()
  public async createPhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestCreatePhone = event.input as RequestCreatePhone;
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.createPhone(
      userId,
      requestCreatePhone
    );
    return { result, error };
  }

  @Authorize()
  public async updatePhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestUpdatePhone = event.input as RequestUpdatePhone;
    const userId = Security.xss(event.params.id);
    const phoneId = Security.xss(event.params.phoneId);
    const { result, error } = await this.userUseCases.updatePhone(
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
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const userId = Security.xss(event.params.id);
    const phoneId = Security.xss(event.params.phoneId);
    const { result, error } = await this.userUseCases.deletePhone(
      userId,
      phoneId
    );
    return { result, error };
  }

  @Authorize()
  public async createEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestCreateEmail = event.input as RequestCreateEmail;
    const userId = Security.xss(event.params.id);
    const { result, error } = await this.userUseCases.createEmail(
      userId,
      requestCreateEmail
    );
    return { result, error };
  }

  @Authorize()
  public async updateEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IUser>> {
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const requestUpdateEmail = event.input as RequestUpdateEmail;
    const userId = Security.xss(event.params.id);
    const emailId = Security.xss(event.params.emailId);
    const { result, error } = await this.userUseCases.updateEmail(
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
    validateRequestAgainstOAS(
      this.openApiSpecification,
      event.schemaOAS,
      event
    );
    const userId = Security.xss(event.params.id);
    const emailId = Security.xss(event.params.emailId);
    const { result, error } = await this.userUseCases.deleteEmail(
      userId,
      emailId
    );
    return { result, error };
  }

  public static compile(factory: IControllerFactory) {
    return new UserController(factory);
  }
}
