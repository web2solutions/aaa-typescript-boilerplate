import { OrganizationEmailDeleteRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/deleteEmail/{emailId}',
  method: 'delete',
  statusCode: 200,
  EventClass: OrganizationEmailDeleteRequestEvent,
  controllerMethod: 'deleteOrganizationEmail',
  withBody: false
});
