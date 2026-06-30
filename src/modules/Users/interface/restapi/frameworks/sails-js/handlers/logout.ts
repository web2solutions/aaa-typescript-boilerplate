import { SailsJsRequest, SailsJsResponse } from '@src/interface/HTTP/adapters/sails-js/SailsJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/sails-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { ILogoutRequest, LogoutRequestEvent } from '@src/modules/Users';

const logout: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/logout',
    method: 'post',
    async handler(req: SailsJsRequest, res: SailsJsResponse) {
      try {
        const { result, error } = await controller!.logout!(new LogoutRequestEvent<ILogoutRequest>({
          authorization: req.headers.authorization ?? '',
          input: req.body as ILogoutRequest,
          schemaOAS: endPointConfig
        }));
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default logout;
