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

import { UserEmailCreateRequestEvent } from '@src/domains/Users/events/UserEmailCreateRequestEvent';
import { RequestCreateEmail } from '@src/domains/Users';

const createEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/createEmail',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .createEmail(new UserEmailCreateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestCreateEmail,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        res.status(201);
        return res.json(result);
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default createEmail;
