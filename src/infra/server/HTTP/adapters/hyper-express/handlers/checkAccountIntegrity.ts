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

import { AccountDataRepository, AccountService } from '@src/domains/Accounts';
import { IIntegrity } from '@src/domains/Accounts/ports/IIntegrity';

const checkAccountIntegrity: EndPointFactory = (
  { dbClient, endPointConfig }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/accounts/{id}/checkIntegrity',
    method: 'get',
    securitySchemes: basicAuth,
    handler(req: HyperExpress.Request, res: HyperExpress.Response) {
      (async () => {
        try {
          isUserAccessGranted(((req as any).profile ?? {}), endPointConfig);
          validateRequestParams(endPointConfig, req.path_parameters);

          const accountId = req.path_parameters.id;
          const service = AccountService.compile({
            repos: {
              AccountDataRepository: AccountDataRepository.compile({ dbClient })
            }
          });
          const integrity: IIntegrity = await service.checkAccountIntegrity(accountId);
          res.status(200).json(integrity);
        } catch (error: unknown) {
          sendErrorResponse(error as Error, res);
        }
      })();
    }
  };
};

export default checkAccountIntegrity;
