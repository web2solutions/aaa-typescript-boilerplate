import { Request, Response } from 'hyper-express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { RequestCreateEmail, UserController, UserEmailCreateRequestEvent } from '@src/modules/Users';

const createEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/createEmail',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const params = req.path_parameters as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .createEmail(new UserEmailCreateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: await req.json() as RequestCreateEmail,
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

export default createEmail;
