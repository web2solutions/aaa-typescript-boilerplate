import { FastifyRequest, FastifyReply } from 'fastify';

import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import {
  isUserAccessGranted,
  validateRequestBody
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { AccountDataRepository, AccountService } from '@src/domains/Accounts';

const addAccount: EndPointFactory = (
  { dbClient, endPointConfig, spec }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/accounts',
    method: 'post',
    securitySchemes: basicAuth,
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const body = req.body as Record<string, any>;
        isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
        validateRequestBody(spec, endPointConfig, body);
        const service = AccountService.compile({
          repos: {
            AccountDataRepository: AccountDataRepository.compile({ dbClient })
          }
        });
        const document = await service.create(body);
        res.code(201);
        return { ...document };
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default addAccount;
