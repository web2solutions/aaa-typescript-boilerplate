import xss from 'xss';
import { FastifyRequest, FastifyReply } from 'fastify';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/fastify/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { TransactionDataRepository, TransactionService } from '@src/domains/Transactions';
import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';

const getTransaction: EndPointFactory = ({
  dbClient,
  endPointConfig,
  mutexClient
}: IHandlerFactory): IbaseHandler => {
  return {
    path: '/transactions/{id}',
    method: 'get',
    securitySchemes: basicAuth,
    handler(req: FastifyRequest, res: FastifyReply) {
      (async () => {
        try {
          const params = req.params as Record<string, any>;
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestParams(endPointConfig, params);

          const transactionId = xss(params.id);
          const service = TransactionService.compile({
            repos: {
              TransactionDataRepository: TransactionDataRepository.compile({ dbClient })
            },
            mutexClient: mutexClient as IMutexClient
          });
          const transaction = await service.getOneById(transactionId);

          const TransactionResponseDTO = { ...transaction };
          res.code(200).send(TransactionResponseDTO);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default getTransaction;
