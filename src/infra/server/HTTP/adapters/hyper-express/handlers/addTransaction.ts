import HyperExpress from 'hyper-express';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/hyper-express/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestBody
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import {
  TransactionService,
  TransactionDataRepository
} from '@src/domains/Transactions';

import {
  AccountDataRepository,
  AccountService
} from '@src/domains/Accounts';
import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';

const addTransaction: EndPointFactory = (
  {
    dbClient, endPointConfig, spec, mutexClient
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/transactions',
    method: 'post',
    securitySchemes: basicAuth,
    handler(req: HyperExpress.Request, res: HyperExpress.Response) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          const body = await req.json();
          validateRequestBody(spec, endPointConfig, body);

          const accountService = AccountService.compile({
            repos: {
              AccountDataRepository: AccountDataRepository.compile({ dbClient })
            }
          });

          const service = TransactionService.compile({
            repos: {
              TransactionDataRepository: TransactionDataRepository.compile({ dbClient })
            },
            services: {
              AccountService: accountService
            },
            mutexClient: mutexClient as IMutexClient
          });
          const transaction = await service.create(body);
          res.status(201).json(transaction);
        } catch (error: unknown) {
          // unlock transaction
          // unlock account;
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default addTransaction;
