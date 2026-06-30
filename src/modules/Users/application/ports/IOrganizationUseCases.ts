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

export interface IOrganizationUseCases {
  create(data: RequestCreateOrganization): Promise<IServiceResponse<IOrganization>>;
  update(id: string, data: RequestUpdateOrganization): Promise<IServiceResponse<IOrganization>>;
  delete(id: string): Promise<IServiceResponse<boolean>>;
  getOneById(id: string): Promise<IServiceResponse<IOrganization>>;
  getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IServiceResponse<IOrganization[]>>;
  createAddress(id: string, data: RequestCreateAddress): Promise<IServiceResponse<IOrganization>>;
  updateAddress(
    id: string,
    addressId: string,
    data: RequestUpdateAddress
  ): Promise<IServiceResponse<IOrganization>>;
  deleteAddress(id: string, addressId: string): Promise<IServiceResponse<IOrganization>>;
  createPhone(id: string, data: RequestCreatePhone): Promise<IServiceResponse<IOrganization>>;
  updatePhone(
    id: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<IServiceResponse<IOrganization>>;
  deletePhone(id: string, phoneId: string): Promise<IServiceResponse<IOrganization>>;
  createEmail(id: string, data: RequestCreateEmail): Promise<IServiceResponse<IOrganization>>;
  updateEmail(
    id: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<IServiceResponse<IOrganization>>;
  deleteEmail(id: string, emailId: string): Promise<IServiceResponse<IOrganization>>;
}
