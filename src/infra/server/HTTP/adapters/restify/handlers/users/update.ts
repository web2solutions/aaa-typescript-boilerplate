import { Request, Response } from 'restify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';
import { UserUpdateRequestEvent } from '@src/domains/Users/events/UserUpdateRequestEvent';

const update: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'put',
    async handler(req: Request, res: Response) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await controller!.update!(new UserUpdateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: req.body,
          schemaOAS: endPointConfig,
          params
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

export default update;
