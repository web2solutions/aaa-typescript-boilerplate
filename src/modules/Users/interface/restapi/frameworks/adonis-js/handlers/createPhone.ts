import { AdonisJsRequest, AdonisJsResponse } from '@src/interface/HTTP/adapters/adonis-js/AdonisJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/adonis-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { RequestCreatePhone, UserController, UserPhoneCreateRequestEvent } from '@src/modules/Users';

const createPhone: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/createPhone',
    method: 'post',
    async handler(req: AdonisJsRequest, res: AdonisJsResponse) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .createPhone(new UserPhoneCreateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestCreatePhone,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        return res.status(201).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default createPhone;
