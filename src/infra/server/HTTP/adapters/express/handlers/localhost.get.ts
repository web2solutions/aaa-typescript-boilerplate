import { Request, Response } from 'express';

import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';
import { Context } from '@src/infra/context/Context';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    handler(req: Request, res: Response) {
      try {
        const store: Map<any, any> = Context.getStore() as Map<any, any>;
        res.json({ status: 'result', correlationId: store.get('correlationId') });
      } catch (error: unknown) {
        sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default localhostGetHandlerFactory;
