import { OrganizationPhoneCreateRequestEvent } from '@src/modules/Users';
import { createOrganizationMutationHandler } from './_organizationMutationHandlerFactory';

export default createOrganizationMutationHandler({
  path: '/organizations/{id}/createPhone',
  method: 'post',
  statusCode: 201,
  EventClass: OrganizationPhoneCreateRequestEvent,
  controllerMethod: 'createOrganizationPhone'
});
