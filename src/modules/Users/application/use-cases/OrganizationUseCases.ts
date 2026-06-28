import { IServiceResponse, IPagingRequest } from '@src/modules/port';
import { IOrganization } from '@src/modules/Users/domain/Entity/IOrganization';
import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdateAddress } from '@src/modules/Users/interface/dto/RequestUpdateAddress';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';
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

  public async createAddress(
    id: string,
    data: RequestCreateAddress
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.createAddress(id, data);
  }

  public async updateAddress(
    id: string,
    addressId: string,
    data: RequestUpdateAddress
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.updateAddress(id, addressId, data);
  }

  public async deleteAddress(
    id: string,
    addressId: string
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.deleteAddress(id, addressId);
  }

  public async createPhone(
    id: string,
    data: RequestCreatePhone
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.createPhone(id, data);
  }

  public async updatePhone(
    id: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.updatePhone(id, phoneId, data);
  }

  public async deletePhone(
    id: string,
    phoneId: string
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.deletePhone(id, phoneId);
  }

  public async createEmail(
    id: string,
    data: RequestCreateEmail
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.createEmail(id, data);
  }

  public async updateEmail(
    id: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.updateEmail(id, emailId, data);
  }

  public async deleteEmail(
    id: string,
    emailId: string
  ): Promise<IServiceResponse<IOrganization>> {
    return this.organizationService.deleteEmail(id, emailId);
  }

  public static compile(organizationService: OrganizationService): OrganizationUseCases {
    return new OrganizationUseCases(organizationService);
  }
}
