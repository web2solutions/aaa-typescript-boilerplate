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
import { UserEmailDeleteRequestEvent } from '@src/domains/Users/events/UserEmailDeleteRequestEvent';

const deleteEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deleteEmail/{emailId}',
    method: 'delete',

    async handler(req: Request, res: Response) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .deleteEmail(new UserEmailDeleteRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default deleteEmail;
