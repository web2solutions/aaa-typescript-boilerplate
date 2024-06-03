import { FastifyRequest, FastifyReply } from 'fastify';
import { Security } from '@src/infra/security';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import {
  isUserAccessGranted,
  throwIfOASInputValidationFails,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';
import { RequestUpdatePassword, UserDataRepository, UserService } from '@src/domains/Users';

const updatePassword: EndPointFactory = (
  { dbClient, endPointConfig, spec }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updatePassword',
    method: 'put',

    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = req.params as Record<string, any>;
        const body = req.body as Record<string, any>;
        isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
        validateRequestParams(endPointConfig, params);
        throwIfOASInputValidationFails(spec, endPointConfig, body);

        const userId = Security.xss(params.id);
        const userDataRepository = UserDataRepository.compile({ dbClient });
        const service: UserService = UserService.compile({
          repos: {
            UserDataRepository: userDataRepository
          }
        });

        const { ok, error } = await service.updatePassword(userId, body as RequestUpdatePassword);
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

export default updatePassword;
