import { Request, Response } from 'hyper-express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { RequestUpdatePassword, UserController, UserPasswordUpdateRequestEvent } from '@src/modules/Users';

const updatePassword: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updatePassword',
    method: 'put',

    async handler(req: Request, res: Response) {
      try {
        const params = req.path_parameters as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .updatePassword(new UserPasswordUpdateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: await req.json() as RequestUpdatePassword,
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

export default updatePassword;
