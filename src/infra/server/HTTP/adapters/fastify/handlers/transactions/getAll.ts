import { FastifyRequest, FastifyReply } from 'fastify';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import {
  isUserAccessGranted
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { TransactionDataRepository, TransactionService } from '@src/domains/Transactions';
import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';

const getTransactions: EndPointFactory = ({
  dbClient,
  endPointConfig,
  mutexClient
}: IHandlerFactory): IbaseHandler => {
  return {
    path: '/transactions',
    method: 'get',
    securitySchemes: basicAuth,
    handler(req: FastifyRequest, res: FastifyReply) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          const service = TransactionService.compile({
            repos: {
              TransactionDataRepository: TransactionDataRepository.compile({ dbClient })
            },
            mutexClient: mutexClient as IMutexClient
          });
          const transactions = await service.getAll();
          res.code(200).send(transactions);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default getTransactions;
