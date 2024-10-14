import { Request, Response } from 'express';

import { EndPointFactory, IbaseHandler } from '@src/interface/HTTP/ports';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/express/responses/sendErrorResponse';
import { Context } from '@src/infra/context/Context';
import { BaseError } from '@src/infra/exceptions';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    handler(req: Request, res: Response) {
      try {
        const store: Map<any, any> = Context.getStore() as Map<any, any>;
        res.json({ status: 'result', correlationId: store.get('correlationId') });
      } catch (error: any) {
        sendErrorResponse(error as BaseError, res);
      }
    }
  };
};

export default localhostGetHandlerFactory;
