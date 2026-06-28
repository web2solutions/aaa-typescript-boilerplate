import { IController, IControllerFactory } from '@src/interface/HTTP/ports';
import { BaseController } from '@src/interface/HTTP/ports/BaseController';
import { Security } from '@src/infra/security';
import { _INFRA_NOT_IMPLEMENTED_ } from '@src/config/constants';
import { ForbiddenError } from '@src/infra/exceptions';
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
import { EUserRole, hasSuperadminRole } from '@src/modules/Users/domain/security/Rbac';

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

  // eslint-disable-next-line class-methods-use-this
  private getAuthenticatedUser(event: BaseDomainEvent): Record<string, any> {
    return ((event as any).authenticatedUser || {}) as Record<string, any>;
  }

  private async enforceUserReadScope(event: BaseDomainEvent, targetUserId: string): Promise<void> {
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (!roles.length) return;
    if (hasSuperadminRole(roles)) return;

    if (!authenticatedUser.organization) {
      throw new ForbiddenError('Insufficient permission - organization scope is required');
    }
    const { result: targetUser, error } = await this.userUseCases.getOneById(targetUserId);
    if (error || !targetUser) {
      throw error || new ForbiddenError('Insufficient permission - target user not available');
    }
    if (targetUser.id === authenticatedUser.id) return;
    if (targetUser.organization !== authenticatedUser.organization) {
      throw new ForbiddenError('Insufficient permission - cross organization access is forbidden');
    }
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
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (roles.length > 0 && !hasSuperadminRole(roles)) {
      if (!authenticatedUser.organization) {
        throw new ForbiddenError('Insufficient permission - organization scope is required');
      }
      if (!requestCreateUser.organization) {
        requestCreateUser.organization = authenticatedUser.organization;
      }
      if (requestCreateUser.organization !== authenticatedUser.organization) {
        throw new ForbiddenError('Insufficient permission - cross organization access is forbidden');
      }
    }
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (roles.length > 0 && !hasSuperadminRole(roles)) {
      if (!authenticatedUser.organization) {
        throw new ForbiddenError('Insufficient permission - organization scope is required');
      }
      filters.organization = authenticatedUser.organization;
      if (roles.length === 1 && roles[0] === EUserRole.user) {
        filters.id = authenticatedUser.id;
      }
    }
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
    await this.enforceUserReadScope(event, userId);
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
