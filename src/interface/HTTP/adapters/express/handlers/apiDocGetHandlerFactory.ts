import { Request, Response } from 'express';

import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/interface/HTTP/ports';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/express/responses/sendErrorResponse';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: Request, res: Response) {
      try {
        res.json(spec);
      } catch (error: any) {
        sendErrorResponse(error, res);
      }
    }
  };
};

export default apiDocGetHandlerFactory;
