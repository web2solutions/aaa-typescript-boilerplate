import { TotalJsRequest, TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/total-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { IRegisterRequest, RegisterRequestEvent } from '@src/modules/Users';

const register: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/register',
    method: 'post',
    async handler(req: TotalJsRequest, res: TotalJsResponse) {
      try {
        const { result, error } = await controller!.register!(
          new RegisterRequestEvent<IRegisterRequest>({
            input: req.body as IRegisterRequest,
            schemaOAS: endPointConfig
          })
        );
        if (error) throw error;
        return res.status(201).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default register;
