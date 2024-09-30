import { Request, Response, Next } from 'restify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';
import { UserGetOneRequestEvent } from '@src/domains/Users/events/UserGetOneRequestEvent';

const getOneById: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'get',

    async handler(req: Request, res: Response, next: Next) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await controller!.getOneById(new UserGetOneRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          params
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

export default getOneById;
