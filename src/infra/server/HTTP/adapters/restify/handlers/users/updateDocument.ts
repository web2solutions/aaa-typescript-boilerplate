import { Request, Response } from 'restify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory,
  UserController
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';
import { UserDocumentUpdateRequestEvent } from '@src/domains/Users/events/UserDocumentUpdateRequestEvent';
import { RequestUpdateDocument } from '@src/domains/Users';

const updateDocument: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updateDocument/{documentId}',
    method: 'put',

    async handler(req: Request, res: Response) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .updateDocument(new UserDocumentUpdateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestUpdateDocument,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        res.status(200);
        return res.json(result);
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default updateDocument;
