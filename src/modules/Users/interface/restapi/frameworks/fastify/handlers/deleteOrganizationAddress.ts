import { OrganizationAddressDeleteRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/deleteAddress/{addressId}',
  method: 'delete',
  statusCode: 200,
  EventClass: OrganizationAddressDeleteRequestEvent,
  controllerMethod: 'deleteOrganizationAddress',
  withBody: false
});
