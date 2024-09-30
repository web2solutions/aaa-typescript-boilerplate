import { Request, Response } from 'restify';
import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/infra/server/HTTP/ports';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/restify/responses/sendErrorResponse';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    async handler(req: Request, res: Response): Promise<any> {
      try {
        return res.json(spec);
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default apiDocGetHandlerFactory;
