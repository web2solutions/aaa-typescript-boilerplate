import { FastifyRequest, FastifyReply } from 'fastify';
import xss from 'xss';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestBody,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { UserDataRepository, UserService } from '@src/domains/Users';
import { RequestUpdateUser } from '@src/domains/Users/ports/dto/RequestUpdateUser';

const update: EndPointFactory = (
  { dbClient, endPointConfig, spec }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'put',
    securitySchemes: basicAuth,
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const body = req.body as Record<string, any>;
        const params = req.params as Record<string, any>;
        isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
        validateRequestParams(endPointConfig, params);
        validateRequestBody(spec, endPointConfig, body);
        const userId = xss(params.id);
        const userDataRepository = UserDataRepository.compile({ dbClient });
        const service: UserService = UserService.compile({
          repos: {
            UserDataRepository: userDataRepository
          }
        });
        const { ok, error } = await service.update(userId, body as RequestUpdateUser);
        if (error) {
          throw error;
        }
        res.code(200);
        return ok;
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default update;
