import { OrganizationPhoneUpdateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/updatePhone/{phoneId}',
  method: 'put',
  statusCode: 200,
  EventClass: OrganizationPhoneUpdateRequestEvent,
  controllerMethod: 'updateOrganizationPhone'
});
