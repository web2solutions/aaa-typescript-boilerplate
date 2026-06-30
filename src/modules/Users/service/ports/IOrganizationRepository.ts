import { IPagingRequest, IPagingResponse } from '@src/modules/port';
import { Organization } from '@src/modules/Users/domain/Model/Organization';
import { RequestCreateAddress } from '@src/modules/Users/interface/dto/RequestCreateAddress';
import { RequestCreateEmail } from '@src/modules/Users/interface/dto/RequestCreateEmail';
import { RequestCreateOrganization } from '@src/modules/Users/interface/dto/RequestCreateOrganization';
import { RequestCreatePhone } from '@src/modules/Users/interface/dto/RequestCreatePhone';
import { RequestUpdateAddress } from '@src/modules/Users/interface/dto/RequestUpdateAddress';
import { RequestUpdateEmail } from '@src/modules/Users/interface/dto/RequestUpdateEmail';
import { RequestUpdateOrganization } from '@src/modules/Users/interface/dto/RequestUpdateOrganization';
import { RequestUpdatePhone } from '@src/modules/Users/interface/dto/RequestUpdatePhone';

export interface IOrganizationRepository {
  create(data: RequestCreateOrganization): Promise<Organization>;
  update(id: string, data: RequestUpdateOrganization): Promise<Organization>;
  delete(id: string): Promise<boolean>;
  getOneById(id: string): Promise<Organization>;
  getAll(
    filters: Record<string, string | number>,
    paging: IPagingRequest
  ): Promise<IPagingResponse<Organization[]>>;
  createAddress(organizationId: string, data: RequestCreateAddress): Promise<Organization>;
  updateAddress(
    organizationId: string,
    addressId: string,
    data: RequestUpdateAddress
  ): Promise<Organization>;
  deleteAddress(organizationId: string, addressId: string): Promise<Organization>;
  createPhone(organizationId: string, data: RequestCreatePhone): Promise<Organization>;
  updatePhone(
    organizationId: string,
    phoneId: string,
    data: RequestUpdatePhone
  ): Promise<Organization>;
  deletePhone(organizationId: string, phoneId: string): Promise<Organization>;
  createEmail(organizationId: string, data: RequestCreateEmail): Promise<Organization>;
  updateEmail(
    organizationId: string,
    emailId: string,
    data: RequestUpdateEmail
  ): Promise<Organization>;
  deleteEmail(organizationId: string, emailId: string): Promise<Organization>;
}
