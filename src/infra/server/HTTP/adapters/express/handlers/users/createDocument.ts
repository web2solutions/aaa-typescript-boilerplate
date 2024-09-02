import { Request, Response } from 'express';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory,
  UserController
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';

import { UserDocumentCreateRequestEvent } from '@src/domains/Users/events/UserDocumentCreateRequestEvent';
import { RequestCreateDocument } from '@src/domains/Users';

const createDocument: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/createDocument',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .createDocument(new UserDocumentCreateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestCreateDocument,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        return res.status(201).json(result);
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default createDocument;
