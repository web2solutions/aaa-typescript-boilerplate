import { Request, Response } from 'restify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UpdatePasswordRequestEvent } from '@src/modules/Users/events/UpdatePasswordRequestEvent';
import { IUpdatePasswordRequest } from '@src/modules/Users';

const updateUserPassword: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/updateUserPassword',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const { result, error } = await controller!.updatePassword!(
          new UpdatePasswordRequestEvent<IUpdatePasswordRequest>({
            authorization: req.headers.authorization ?? '',
            input: req.body as IUpdatePasswordRequest,
            schemaOAS: endPointConfig
          })
        );
        if (error) throw error;
        res.status(200);
        return res.json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default updateUserPassword;
