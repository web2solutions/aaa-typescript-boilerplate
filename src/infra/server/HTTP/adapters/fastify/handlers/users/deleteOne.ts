import { FastifyRequest, FastifyReply } from 'fastify';
import xss from 'xss';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { UserDataRepository, UserService } from '@src/domains/Users';

const deleteOne: EndPointFactory = (
  { dbClient, endPointConfig }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'delete',
    securitySchemes: basicAuth,
    handler(req: FastifyRequest, res: FastifyReply) {
      (async () => {
        try {
          const params = req.params as Record<string, any>;
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestParams(endPointConfig, params);
          const userId = xss(params.id);
          const service: UserService = UserService.compile({
            repos: {
              UserDataRepository: UserDataRepository.compile({ dbClient })
            }
          });
          const deleted = await service.delete(userId);
          res.code(200).send({ deleted: !!deleted });
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default deleteOne;
