import { Request, Response, Next } from 'restify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';
import { UserGetAllRequestEvent } from '@src/domains/Users/events/UserGetAllRequestEvent';

const getAll: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users',
    method: 'get',

    async handler(req: Request, res: Response, next: Next) {
      try {
        const queryString = req.query as Record<string, any> || {};
        if (!queryString.page) queryString.page = 1;
        const {
          result, error, page, size, total
        } = await controller!.getAll(new UserGetAllRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          queryString
        }));
        // console.log({ error });
        if (error) throw error;
        res.status(200);
        res.json({
          result, error, page, size, total
        });
        return next();
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
        return next(error as Error);
      }
    }
  };
};

export default getAll;
