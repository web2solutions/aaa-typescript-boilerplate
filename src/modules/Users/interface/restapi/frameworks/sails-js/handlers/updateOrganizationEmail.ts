import { OrganizationEmailUpdateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/updateEmail/{emailId}',
  method: 'put',
  statusCode: 200,
  EventClass: OrganizationEmailUpdateRequestEvent,
  controllerMethod: 'updateOrganizationEmail'
});
