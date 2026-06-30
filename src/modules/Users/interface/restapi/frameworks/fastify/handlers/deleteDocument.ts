import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserDocumentDeleteRequestEvent, UserController } from '@src/modules/Users';

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
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default deleteDocument;
