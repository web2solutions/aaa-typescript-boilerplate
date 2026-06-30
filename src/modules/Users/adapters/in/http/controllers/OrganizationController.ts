import { IController, IControllerFactory } from '@src/interface/HTTP/ports';
import { BaseController } from '@src/interface/HTTP/ports/BaseController';
import { Security } from '@src/infra/security';
import { _INFRA_NOT_IMPLEMENTED_ } from '@src/config/constants';
import { ForbiddenError } from '@src/infra/exceptions';
import { validateRequestAgainstOAS } from '@src/interface/HTTP/validators';
import { Authorize } from '@src/shared/decorators/guard/Authorize';
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import {
  IServiceResponse, setFilter, setPaging
} from '@src/modules/port';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { IOrganizationUseCases } from '@src/modules/Users/application/ports/IOrganizationUseCases';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestUpdateAddress } from '@src/modules/Users/interface/dto/RequestUpdateAddress';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { hasSuperadminRole } from '@src/modules/Users/domain/security/Rbac';

export class OrganizationController extends BaseController implements IController {
  private readonly organizationUseCases: IOrganizationUseCases;

  constructor(factory: IControllerFactory) {
    super(factory);
    if (!factory.organizationUseCases) {
      const error = new Error('OrganizationUseCases is not implemented');
      error.name = _INFRA_NOT_IMPLEMENTED_;
      throw error;
    }
    this.organizationUseCases = factory.organizationUseCases;
  }

  // eslint-disable-next-line class-methods-use-this
  private getAuthenticatedUser(event: BaseDomainEvent): Record<string, any> {
    return ((event as any).authenticatedUser || {}) as Record<string, any>;
  }

  private enforceOrganizationScope(event: BaseDomainEvent, organizationId: string): void {
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (!roles.length) return;
    if (hasSuperadminRole(roles)) return;

    if (!authenticatedUser.organization) {
      throw new ForbiddenError('Insufficient permission - organization scope is required');
    }
    if (organizationId !== authenticatedUser.organization) {
      throw new ForbiddenError('Insufficient permission - cross organization access is forbidden');
    }
  }

  @Authorize()
  public async create(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const requestCreateOrganization = event.input as RequestCreateOrganization;
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (roles.length > 0 && !hasSuperadminRole(roles)) {
      throw new ForbiddenError('Insufficient permission - only superadmin can create organizations');
    }
    const { result, error } = await this.organizationUseCases.create(requestCreateOrganization);
    return { result, error };
  }

  @Authorize()
  public async update(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const requestUpdateOrganization = event.input as RequestUpdateOrganization;
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const { result, error } = await this.organizationUseCases.update(
      organizationId,
      requestUpdateOrganization
    );
    return { result, error };
  }

  @Authorize()
  public async delete(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<boolean>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const { result, error } = await this.organizationUseCases.delete(organizationId);
    return { result, error };
  }

  @Authorize()
  public async getOneById(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const { result, error } = await this.organizationUseCases.getOneById(organizationId);
    return { result, error };
  }

  @Authorize()
  public async getAll(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization[]>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const filters = setFilter(event);
    const authenticatedUser = this.getAuthenticatedUser(event);
    const roles = authenticatedUser.roles || [];
    if (roles.length > 0 && !hasSuperadminRole(roles)) {
      if (!authenticatedUser.organization) {
        throw new ForbiddenError('Insufficient permission - organization scope is required');
      }
      filters.id = authenticatedUser.organization;
    }
    const paging = setPaging(event);
    return this.organizationUseCases.getAll(
      { ...filters },
      paging
    );
  }

  @Authorize()
  public async createAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const requestCreateAddress = event.input as RequestCreateAddress;
    const { result, error } = await this.organizationUseCases.createAddress(
      organizationId,
      requestCreateAddress
    );
    return { result, error };
  }

  @Authorize()
  public async updateAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const addressId = Security.xss(event.params.addressId);
    const requestUpdateAddress = event.input as RequestUpdateAddress;
    const { result, error } = await this.organizationUseCases.updateAddress(
      organizationId,
      addressId,
      requestUpdateAddress
    );
    return { result, error };
  }

  @Authorize()
  public async deleteAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const addressId = Security.xss(event.params.addressId);
    const { result, error } = await this.organizationUseCases.deleteAddress(
      organizationId,
      addressId
    );
    return { result, error };
  }

  @Authorize()
  public async createPhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const requestCreatePhone = event.input as RequestCreatePhone;
    const { result, error } = await this.organizationUseCases.createPhone(
      organizationId,
      requestCreatePhone
    );
    return { result, error };
  }

  @Authorize()
  public async updatePhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const phoneId = Security.xss(event.params.phoneId);
    const requestUpdatePhone = event.input as RequestUpdatePhone;
    const { result, error } = await this.organizationUseCases.updatePhone(
      organizationId,
      phoneId,
      requestUpdatePhone
    );
    return { result, error };
  }

  @Authorize()
  public async deletePhone(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const phoneId = Security.xss(event.params.phoneId);
    const { result, error } = await this.organizationUseCases.deletePhone(
      organizationId,
      phoneId
    );
    return { result, error };
  }

  @Authorize()
  public async createEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const requestCreateEmail = event.input as RequestCreateEmail;
    const { result, error } = await this.organizationUseCases.createEmail(
      organizationId,
      requestCreateEmail
    );
    return { result, error };
  }

  @Authorize()
  public async updateEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const emailId = Security.xss(event.params.emailId);
    const requestUpdateEmail = event.input as RequestUpdateEmail;
    const { result, error } = await this.organizationUseCases.updateEmail(
      organizationId,
      emailId,
      requestUpdateEmail
    );
    return { result, error };
  }

  @Authorize()
  public async deleteEmail(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    validateRequestAgainstOAS(this.openApiSpecification, event.schemaOAS, event);
    const organizationId = Security.xss(event.params.id);
    this.enforceOrganizationScope(event, organizationId);
    const emailId = Security.xss(event.params.emailId);
    const { result, error } = await this.organizationUseCases.deleteEmail(
      organizationId,
      emailId
    );
    return { result, error };
  }

  // Backward-compatible aliases for existing operationIds/handlers.
  public createOrganization(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.create(event);
  }

  public updateOrganization(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.update(event);
  }

  public deleteOrganization(event: BaseDomainEvent): Promise<IServiceResponse<boolean>> {
    return this.delete(event);
  }

  public getOrganizationById(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.getOneById(event);
  }

  public getAllOrganizations(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization[]>> {
    return this.getAll(event);
  }

  public createOrganizationAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    return this.createAddress(event);
  }

  public updateOrganizationAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    return this.updateAddress(event);
  }

  public deleteOrganizationAddress(
    event: BaseDomainEvent
  ): Promise<IServiceResponse<IOrganization>> {
    return this.deleteAddress(event);
  }

  public createOrganizationPhone(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.createPhone(event);
  }

  public updateOrganizationPhone(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.updatePhone(event);
  }

  public deleteOrganizationPhone(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.deletePhone(event);
  }

  public createOrganizationEmail(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.createEmail(event);
  }

  public updateOrganizationEmail(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.updateEmail(event);
  }

  public deleteOrganizationEmail(event: BaseDomainEvent): Promise<IServiceResponse<IOrganization>> {
    return this.deleteEmail(event);
  }

  public static compile(factory: IControllerFactory) {
    return new OrganizationController(factory);
  }
}
