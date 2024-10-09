import { Request, Response } from 'restify';

import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';
import { Context } from '@src/infra/context/Context';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    async handler(req: Request, res: Response) {
      const store: Map<any, any> = Context.getStore() as Map<any, any>;
      return res.json({ status: 'result', correlationId: store.get('correlationId') });
    }
  };
};

export default localhostGetHandlerFactory;
