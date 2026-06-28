import { UserDocumentCreateRequestEvent } from '@src/modules/Users';
import { createDocumentMutationHandler } from './_documentMutationHandlerFactory';

export default createDocumentMutationHandler({
  path: '/users/{id}/createDocument',
  method: 'post',
  statusCode: 201,
  EventClass: UserDocumentCreateRequestEvent,
  controllerMethod: 'createDocument'
});
