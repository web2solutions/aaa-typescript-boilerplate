import { Request, Response } from 'express';

import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    handler(req: Request, res: Response) {
      try {
        res.json({ status: 'result' });
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default localhostGetHandlerFactory;
