import { Request, Response, Next } from 'restify';
import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: Request, res: Response, next: Next) {
      try {
        res.json(spec);
        return next();
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
        return next(error as Error);
      }
    }
  };
};

export default apiDocGetHandlerFactory;
