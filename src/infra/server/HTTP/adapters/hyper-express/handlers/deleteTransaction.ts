import HyperExpress from 'hyper-express';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/hyper-express/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import { TransactionDataRepository, TransactionService } from '@src/domains/Transactions';
import { AccountDataRepository, AccountService } from '@src/domains/Accounts';

import { IMutexClient } from '@src/domains/ports/mutex/IMutexClient';

const deleteTransaction: EndPointFactory = ({
  dbClient,
  endPointConfig,
  mutexClient
}: IHandlerFactory): IbaseHandler => {
  return {
    path: '/transactions/{id}',
    method: 'delete',
    securitySchemes: basicAuth,
    handler(req: HyperExpress.Request, res: HyperExpress.Response) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestParams(endPointConfig, req.path_parameters);

          const transactionId = req.path_parameters.id;
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
          const deleted = await service.delete(transactionId);

          res.status(200).json({ deleted: !!deleted });
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default deleteTransaction;
