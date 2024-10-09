import { Request, Response } from 'restify';

import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    async handler(req: Request, res: Response) {
      return res.json({ status: 'result' });
    }
  };
};

export default localhostGetHandlerFactory;
