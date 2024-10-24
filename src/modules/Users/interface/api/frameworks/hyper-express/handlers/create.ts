import { Request, Response } from 'hyper-express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';

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
    async handler(req: Request, res: Response) {
      try {
        const { result, error } = await controller!.create!(new UserCreateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: await req.json(),
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
