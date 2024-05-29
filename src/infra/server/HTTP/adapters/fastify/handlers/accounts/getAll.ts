import { FastifyRequest, FastifyReply } from 'fastify';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import {
  isUserAccessGranted
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { AccountDataRepository, AccountService } from '@src/domains/Accounts';

const getAccounts: EndPointFactory = (
  { dbClient, endPointConfig }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/accounts',
    method: 'get',
    securitySchemes: basicAuth,
    handler(req: FastifyRequest, res: FastifyReply) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          const service = AccountService.compile({
            repos: {
              AccountDataRepository: AccountDataRepository.compile({ dbClient })
            }
          });
          const accounts = await service.getAll();
          res.code(200).send(accounts);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default getAccounts;
