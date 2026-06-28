import { OrganizationAddressCreateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/createAddress',
  method: 'post',
  statusCode: 201,
  EventClass: OrganizationAddressCreateRequestEvent,
  controllerMethod: 'createOrganizationAddress'
});
