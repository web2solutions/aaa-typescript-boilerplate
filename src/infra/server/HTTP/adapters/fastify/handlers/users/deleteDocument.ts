import { FastifyRequest, FastifyReply } from 'fastify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory,
  UserController
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';
import { UserDocumentDeleteRequestEvent } from '@src/domains/Users/events/UserDocumentDeleteRequestEvent';

const deleteDocument: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deleteDocument/{documentId}',
    method: 'delete',

    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = JSON.parse(JSON.stringify(req.params));
        const { result, error } = await (controller! as UserController)
          .deleteDocument(new UserDocumentDeleteRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default deleteDocument;
