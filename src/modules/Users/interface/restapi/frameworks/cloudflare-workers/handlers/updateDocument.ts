import { UserDocumentUpdateRequestEvent } from '@src/modules/Users';
import { createDocumentMutationHandler } from './_documentMutationHandlerFactory';

export default createDocumentMutationHandler({
  path: '/users/{id}/updateDocument/{documentId}',
  method: 'put',
  statusCode: 200,
  EventClass: UserDocumentUpdateRequestEvent,
  controllerMethod: 'updateDocument'
});
