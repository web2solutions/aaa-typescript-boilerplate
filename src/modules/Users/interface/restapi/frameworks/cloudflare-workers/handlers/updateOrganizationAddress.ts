import { OrganizationAddressUpdateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/updateAddress/{addressId}',
  method: 'put',
  statusCode: 200,
  EventClass: OrganizationAddressUpdateRequestEvent,
  controllerMethod: 'updateOrganizationAddress'
});
