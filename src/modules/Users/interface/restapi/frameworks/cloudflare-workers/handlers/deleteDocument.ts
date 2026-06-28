import { UserDocumentDeleteRequestEvent } from '@src/modules/Users';
import { createDocumentMutationHandler } from './_documentMutationHandlerFactory';

export default createDocumentMutationHandler({
  path: '/users/{id}/deleteDocument/{documentId}',
  method: 'delete',
  statusCode: 200,
  EventClass: UserDocumentDeleteRequestEvent,
  controllerMethod: 'deleteDocument',
  withBody: false
});
