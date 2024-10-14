import { Request, Response } from 'restify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';
import {
  sendErrorResponse
} from '@src/interface/HTTP/adapters/restify/responses/sendErrorResponse';
import {
  UserCreateRequestEvent
} from '@src/modules/Users/events/UserCreateRequestEvent';

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
          input: req.body,
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

export default create;
