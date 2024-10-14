import { Request, Response } from 'restify';
import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/interface/HTTP/ports';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    async handler(req: Request, res: Response): Promise<any> {
      try {
        return res.json(spec);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default apiDocGetHandlerFactory;
