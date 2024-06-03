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
import { RequestUpdatePhone, UserDataRepository, UserService } from '@src/domains/Users';

const updatePhone: EndPointFactory = (
  { dbClient, endPointConfig, spec }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updatePhone/{phoneId}',
    method: 'put',

    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = req.params as Record<string, any>;
        const body = req.body as Record<string, any>;
        isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
        validateRequestParams(endPointConfig, params);
        throwIfOASInputValidationFails(spec, endPointConfig, body);

        const userId = Security.xss(params.id);
        const phoneId = Security.xss(params.phoneId);

        const userDataRepository = UserDataRepository.compile({ dbClient });
        const service: UserService = UserService.compile({
          repos: {
            UserDataRepository: userDataRepository
          }
        });

        const { ok, error } = await service.updatePhone(
          userId,
          phoneId,
          body as RequestUpdatePhone
        );

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

export default updatePhone;
