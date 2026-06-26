import { IPagingRequest, IPagingResponse } from '@src/modules/port';
import { Organization } from '@src/modules/Users/domain/Model/Organization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';

export interface IOrganizationRepository {
  create(data: RequestCreateOrganization): Promise<Organization>;
  update(id: string, data: RequestUpdateOrganization): Promise<Organization>;
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<Organization>;
  getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<Organization[]>>;
}
