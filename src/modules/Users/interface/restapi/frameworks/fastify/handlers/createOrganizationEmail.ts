import { OrganizationEmailCreateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/createEmail',
  method: 'post',
  statusCode: 201,
  EventClass: OrganizationEmailCreateRequestEvent,
  controllerMethod: 'createOrganizationEmail'
});
