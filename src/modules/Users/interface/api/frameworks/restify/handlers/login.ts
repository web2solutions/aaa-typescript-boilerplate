import { Request, Response } from 'restify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { ILoginRequest, LoginRequestEvent } from '@src/modules/Users';

const login: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/login',
    method: 'post',
    async handler(req: Request, res: Response) {
      try {
        const { result, error } = await controller!.login!(new LoginRequestEvent<ILoginRequest>({
          input: req.body as ILoginRequest,
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

export default login;
