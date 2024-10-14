import { FastifyRequest, FastifyReply } from 'fastify';

import { EndPointFactory, IbaseHandler, IHandlerFactory } from '@src/interface/HTTP/ports';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';
import { BaseError } from '@src/infra/exceptions';

const apiDocGetHandlerFactory: EndPointFactory = (
  { spec, version }: IHandlerFactory
): IbaseHandler => {
  return {
    path: `/${version}`,
    method: 'get',
    handler(req: FastifyRequest, res: FastifyReply) {
      (async () => {
        try {
          res.send(spec);
        } catch (error: unknown) {
          sendErrorResponse(error as BaseError, res);
        }
      })();
    }
  };
};

export default apiDocGetHandlerFactory;
