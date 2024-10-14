import HyperExpress from 'hyper-express';
import { EndPointFactory } from '@src/interface/HTTP/ports/EndPointFactory';
import { IbaseHandler } from '@src/interface/HTTP/ports/IbaseHandler';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';
import { IHandlerFactory } from '@src/interface/HTTP/ports/IHandlerFactory';
import { BaseError } from '@src/infra/exceptions';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: HyperExpress.Request, res: HyperExpress.Response) {
      (async () => {
        try {
          res.json(spec);
        } catch (error: unknown) {
          sendErrorResponse(error as BaseError, res);
        }
      })();
    }
  };
};

export default apiDocGetHandlerFactory;
