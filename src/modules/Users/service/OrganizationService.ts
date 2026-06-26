import {
  BaseService,
  IServiceConfig,
  IServiceResponse,
  IPagingRequest
} from '@src/modules/port';
import { BaseError } from '@src/infra/exceptions';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { OrganizationDataRepository } from '@src/modules/Users/adapters/out/persistence/OrganizationDataRepository';

interface IOrganizationServiceConfig extends IServiceConfig {
}

export class OrganizationService extends BaseService<
IOrganization,
RequestCreateOrganization,
RequestUpdateOrganization
> {
  public dataRepository: OrganizationDataRepository;

  public constructor(config: IOrganizationServiceConfig) {
    super(config);
    this.dataRepository = config.dataRepository as OrganizationDataRepository;
  }

  public async create(data: RequestCreateOrganization): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.create(data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async update(
    id: string,
    data: RequestUpdateOrganization
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.update(id, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async delete(id: string): Promise<IServiceResponse<boolean>> {
    const serviceResponse: IServiceResponse<boolean> = {};
    try {
      serviceResponse.result = await this.dataRepository.delete(id);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async getOneById(id: string): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.getOneById(id);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IOrganization[]>> {
    const serviceResponse: IServiceResponse<IOrganization[]> = {};
    try {
      const result = await this.dataRepository.getAll(filters, paging);
      return result;
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public static compile(config: IOrganizationServiceConfig): OrganizationService {
    return new OrganizationService(config);
  }
}
