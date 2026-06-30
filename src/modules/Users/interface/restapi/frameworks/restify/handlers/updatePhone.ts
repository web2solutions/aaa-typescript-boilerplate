import { Request, Response } from 'restify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

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

    async handler(req: Request, res: Response) {
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
        res.status(200);
        return res.json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default updatePhone;
