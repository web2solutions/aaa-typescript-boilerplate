import { TotalJsRequest, TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/total-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { IUpdatePasswordRequest, UpdatePasswordRequestEvent } from '@src/modules/Users';

const updateUserPassword: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/updateUserPassword',
    method: 'post',
    async handler(req: TotalJsRequest, res: TotalJsResponse) {
      try {
        const { result, error } = await controller!.updatePassword!(
          new UpdatePasswordRequestEvent<IUpdatePasswordRequest>({
            authorization: req.headers.authorization ?? '',
            input: req.body as IUpdatePasswordRequest,
            schemaOAS: endPointConfig
          })
        );
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default updateUserPassword;
