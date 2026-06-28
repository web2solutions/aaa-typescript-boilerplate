import { OrganizationPhoneDeleteRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/deletePhone/{phoneId}',
  method: 'delete',
  statusCode: 200,
  EventClass: OrganizationPhoneDeleteRequestEvent,
  controllerMethod: 'deleteOrganizationPhone',
  withBody: false
});
