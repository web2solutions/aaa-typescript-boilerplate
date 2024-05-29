import { Request, Response } from 'express';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';
import { IHandlerFactory } from '../../../ports/IHandlerFactory';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: Request, res: Response) {
      (async () => {
        try {
          res.json(spec);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default apiDocGetHandlerFactory;
