import { TotalJsRequest, TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/total-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { RequestUpdatePhone, UserController, UserPhoneUpdateRequestEvent } from '@src/modules/Users';

const updatePhone: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updatePhone/{phoneId}',
    method: 'put',

    async handler(req: TotalJsRequest, res: TotalJsResponse) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .updatePhone(new UserPhoneUpdateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestUpdatePhone,
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

export default updatePhone;
