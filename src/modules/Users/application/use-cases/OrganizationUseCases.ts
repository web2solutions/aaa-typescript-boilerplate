import { IServiceResponse, IPagingRequest } from '@src/modules/port';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { OrganizationService } from '@src/modules/Users/service/OrganizationService';
import { IOrganizationUseCases } from '@src/modules/Users/application/ports/IOrganizationUseCases';

export class OrganizationUseCases implements IOrganizationUseCases {
  private readonly organizationService: OrganizationService;

  constructor(organizationService: OrganizationService) {
    this.organizationService = organizationService;
  }

  public async create(data: RequestCreateOrganization): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.create(data);
  }

  public async update(
    id: string,
    data: RequestUpdateOrganization
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.update(id, data);
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    return this.organizationService.delete(id);
  }

  public async getOneById(id: string): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.getOneById(id);
  }

  public async getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IOrganization[]>> {
    return this.organizationService.getAll(filters, paging);
  }

  public static compile(organizationService: OrganizationService): OrganizationUseCases {
    return new OrganizationUseCases(organizationService);
  }
}
