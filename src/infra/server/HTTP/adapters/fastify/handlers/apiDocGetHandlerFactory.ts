import { FastifyRequest, FastifyReply } from 'fastify';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';

import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

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
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default apiDocGetHandlerFactory;
