import { Request, Response } from 'hyper-express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserController, UserEmailDeleteRequestEvent } from '@src/modules/Users';

const deleteEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deleteEmail/{emailId}',
    method: 'delete',

    async handler(req: Request, res: Response) {
      try {
        const params = req.path_parameters as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .deleteEmail(new UserEmailDeleteRequestEvent({
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

export default deleteEmail;
