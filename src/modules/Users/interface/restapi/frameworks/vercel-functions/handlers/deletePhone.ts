import type { VercelFunctionsRequest, VercelFunctionsResponse } from '@src/interface/HTTP/adapters/vercel-functions/vercel-functions';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/vercel-functions/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserController, UserPhoneDeleteRequestEvent } from '@src/modules/Users';

const deletePhone: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deletePhone/{phoneId}',
    method: 'delete',

    async handler(req: VercelFunctionsRequest, res: VercelFunctionsResponse) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .deletePhone(new UserPhoneDeleteRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
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

export default deletePhone;
