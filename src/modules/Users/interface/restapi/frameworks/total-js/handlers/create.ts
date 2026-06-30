import { TotalJsRequest, TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/total-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserCreateRequestEvent } from '@src/modules/Users/events/UserCreateRequestEvent';

const create: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users',
    method: 'post',
    async handler(req: TotalJsRequest, res: TotalJsResponse) {
      try {
        const { result, error } = await controller!.create!(new UserCreateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: req.body,
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

export default create;
