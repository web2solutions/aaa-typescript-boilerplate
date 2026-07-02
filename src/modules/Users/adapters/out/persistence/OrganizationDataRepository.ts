import { IStore } from '@src/infra/ports/persistence/IStore';
import {
  throwIfPreUpdateValidationFails,
  throwIfNotFound
} from '@src/shared/validators';
import {
  IPagingRequest, IPagingResponse, IRepoConfig, BaseRepo
} from '@src/modules/port';

import { _DEFAULT_PAGE_SIZE_ } from '@src/config/constants';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { Organization } from '@src/modules/Users/domain/Model/Organization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestUpdateAddress } from '@src/modules/Users/interface/dto/RequestUpdateAddress';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { IOrganizationRepository } from '@src/modules/Users/service/ports/IOrganizationRepository';

export class OrganizationDataRepository
  extends BaseRepo<Organization, RequestCreateOrganization, RequestUpdateOrganization>
  implements IOrganizationRepository {
  public store: IStore<IOrganization>;

  public limit: number;

  public constructor(config: IRepoConfig) {
    super(config);
    const { limit } = config;
    this.store = this.databaseClient.stores.Organization;
    this.limit = limit ?? _DEFAULT_PAGE_SIZE_;
  }

  public async create(data: RequestCreateOrganization): Promise<Organization> {
    const model = new Organization(data);
    await this.store.create(model.id, model.serialize());
    return model;
  }

  public async update(id: string, data: RequestUpdateOrganization): Promise<Organization> {
    throwIfPreUpdateValidationFails(id, data);
    const current = await this.getOneById(id);
    const patch = {
      ...new Organization({
        ...current.serialize(),
        ...data
      }).serialize()
    };
    const updated = await this.store.update(id, patch as IOrganization);
    return new Organization(updated);
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  public async getOneById(id: string): Promise<Organization> {
    const raw = await this.store.getOneById(id);
    throwIfNotFound(!!raw);
    return new Organization({ ...raw, readOnly: true });
  }

  public async getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<Organization[]>> {
    const {
      result, page, size, total
    } = await this.store.getAll(filters, paging);
    const currentPage = page ?? paging?.page ?? 1;
    const currentSize = size ?? paging?.size ?? this.limit;
    const rows = result ?? [];
    return {
      page: currentPage,
      size: currentSize,
      total,
      result: rows.map((raw: IOrganization) => new Organization(raw))
    };
  }

  public static compile(config: IRepoConfig): OrganizationDataRepository {
    return new OrganizationDataRepository(config);
  }

  public async createAddress(
    organizationId: string,
    data: RequestCreateAddress
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.createAddress(data);
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async updateAddress(
    organizationId: string,
    addressId: string,
    data: RequestUpdateAddress
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.updateAddress({ ...data, id: addressId });
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async deleteAddress(organizationId: string, addressId: string): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.deleteAddress(addressId);
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async createPhone(
    organizationId: string,
    data: RequestCreatePhone
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.createPhone(data);
    const updated = await this.store.update(
      organizationId,
      model.serialize() as IOrganization
    );
    return new Organization(updated);
  }

  public async updatePhone(
    organizationId: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.updatePhone({ ...data, id: phoneId });
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async deletePhone(organizationId: string, phoneId: string): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.deletePhone(phoneId);
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async createEmail(
    organizationId: string,
    data: RequestCreateEmail
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.createEmail(data);
    const updated = await this.store.update(
      organizationId,
      model.serialize() as IOrganization
    );
    return new Organization(updated);
  }

  public async updateEmail(
    organizationId: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.updateEmail({ ...data, id: emailId });
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }

  public async deleteEmail(organizationId: string, emailId: string): Promise<Organization> {
    const current = await this.getOneById(organizationId);
    const model = new Organization({ ...current.serialize() });
    model.deleteEmail(emailId);
    const updated = await this.store.update(organizationId, model.serialize() as IOrganization);
    return new Organization(updated);
  }
}
