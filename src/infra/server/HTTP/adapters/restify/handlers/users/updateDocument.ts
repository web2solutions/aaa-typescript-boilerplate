import { Request, Response, Next } from 'restify';
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

    async handler(req: Request, res: Response, next: Next) {
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
        res.json(result);
        return next();
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
        return next(error as Error);
      }
    }
  };
};

export default updateDocument;
