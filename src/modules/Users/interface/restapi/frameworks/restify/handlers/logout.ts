import { Request, Response } from 'restify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { LogoutRequestEvent } from '@src/modules/Users/events/LogoutRequestEvent';
import { ILogoutRequest } from '@src/modules/Users';

const logout: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/logout',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const { result, error } = await controller!.logout!(new LogoutRequestEvent<ILogoutRequest>({
          authorization: req.headers.authorization ?? '',
          input: req.body as ILogoutRequest,
          schemaOAS: endPointConfig
        }));
        if (error) throw error;
        res.status(200);
        return res.json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default logout;
