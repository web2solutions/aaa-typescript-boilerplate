import { Request, Response, Next } from 'restify';

import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    handler(req: Request, res: Response, next: Next) {
      try {
        res.json({ status: 'result' });
        return next();
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
        return next(error as Error);
      }
    }
  };
};

export default localhostGetHandlerFactory;
