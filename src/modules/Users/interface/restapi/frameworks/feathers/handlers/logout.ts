import { FeathersRequest, FeathersResponse } from '@src/interface/HTTP/adapters/feathers/FeathersServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/feathers/responses/sendErrorResponse';

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
    async handler(req: FeathersRequest, res: FeathersResponse) {
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
