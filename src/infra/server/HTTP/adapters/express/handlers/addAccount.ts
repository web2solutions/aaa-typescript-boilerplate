import { Request, Response } from 'express';

import { IHandlerFactory } from '@src/infra/server/HTTP/ports/IHandlerFactory';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import basicAuth from '@src/infra/server/HTTP/adapters/express/auth/basicAuth';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import {
  isUserAccessGranted,
  validateRequestBody
} from '@src/infra/server/HTTP/validators';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/express/responses/sendErrorResponse';

import { AccountDataRepository, AccountService } from '@src/domains/Accounts';

const addAccount: EndPointFactory = (
  { dbClient, endPointConfig, spec }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/accounts',
    method: 'post',
    securitySchemes: basicAuth,
    handler(req: Request, res: Response) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestBody(spec, endPointConfig, req.body);
          const service = AccountService.compile({
            repos: {
              AccountDataRepository: AccountDataRepository.compile({ dbClient })
            }
          });
          const document = await service.create(req.body);
          res.status(201).json(document);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default addAccount;
