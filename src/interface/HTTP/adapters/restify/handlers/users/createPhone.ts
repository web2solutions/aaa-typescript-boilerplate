import { Request, Response } from 'restify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

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
    async handler(req: Request, res: Response) {
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
        res.status(201);
        return res.json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default createPhone;
