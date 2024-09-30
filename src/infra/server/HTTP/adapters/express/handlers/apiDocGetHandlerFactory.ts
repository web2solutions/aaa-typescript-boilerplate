import { Request, Response } from 'express';

import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: Request, res: Response) {
      try {
        res.json(spec);
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default apiDocGetHandlerFactory;
