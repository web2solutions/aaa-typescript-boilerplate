import { Request, Response } from 'express';

import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/express/auth/basicAuth';
import {
  isUserAccessGranted,
  validateRequestParams
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';

import { AccountDataRepository, AccountService } from '@src/domains/Accounts';

const deleteAccount: EndPointFactory = (
  { dbClient, endPointConfig }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/accounts/{id}',
    method: 'delete',
    securitySchemes: basicAuth,
    handler(req: Request, res: Response) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestParams(endPointConfig, req.params);
          const accountId = req.params.id;
          const service = AccountService.compile({
            repos: {
              AccountDataRepository: AccountDataRepository.compile({ dbClient })
            }
          });
          const deleted = await service.delete(accountId);
          res.status(200).json({ deleted: !!deleted });
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default deleteAccount;
