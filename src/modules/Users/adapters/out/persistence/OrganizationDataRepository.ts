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
    const patch = { ...(new Organization(data)).serialize() };
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
    return {
      page,
      size,
      total,
      result: result.map((raw: IOrganization) => new Organization(raw))
    };
  }

  public static compile(config: IRepoConfig): OrganizationDataRepository {
    return new OrganizationDataRepository(config);
  }
}
