import { IServiceResponse, IPagingRequest } from '@src/modules/port';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';

export interface IOrganizationUseCases {
  create(data: RequestCreateOrganization): Promise<IServiceResponse<IOrganization>>;
  update(id: string, data: RequestUpdateOrganization): Promise<IServiceResponse<IOrganization>>;
  delete(id: string): Promise<IServiceResponse<boolean>>;
  getOneById(id: string): Promise<IServiceResponse<IOrganization>>;
  getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IOrganization[]>>;
}
