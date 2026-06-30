import {
  BaseService,
  IServiceConfig,
  IServiceResponse,
  IPagingRequest
} from '@src/modules/port';
import { BaseError } from '@src/infra/exceptions';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdateAddress } from '@src/modules/Users/interface/dto/RequestUpdateAddress';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
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

  public async createAddress(
    id: string,
    data: RequestCreateAddress
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.createAddress(id, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async updateAddress(
    id: string,
    addressId: string,
    data: RequestUpdateAddress
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.updateAddress(id, addressId, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async deleteAddress(
    id: string,
    addressId: string
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.deleteAddress(id, addressId);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async createPhone(
    id: string,
    data: RequestCreatePhone
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.createPhone(id, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async updatePhone(
    id: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.updatePhone(id, phoneId, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async deletePhone(id: string, phoneId: string): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.deletePhone(id, phoneId);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async createEmail(
    id: string,
    data: RequestCreateEmail
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.createEmail(id, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async updateEmail(
    id: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.updateEmail(id, emailId, data);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public async deleteEmail(id: string, emailId: string): Promise<IServiceResponse<IOrganization>> {
    const serviceResponse: IServiceResponse<IOrganization> = {};
    try {
      serviceResponse.result = await this.dataRepository.deleteEmail(id, emailId);
    } catch (error) {
      serviceResponse.error = error as BaseError;
    }
    return serviceResponse;
  }

  public static compile(config: IOrganizationServiceConfig): OrganizationService {
    return new OrganizationService(config);
  }
}
