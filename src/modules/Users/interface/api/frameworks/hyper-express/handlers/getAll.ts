import { Request, Response } from 'hyper-express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/hyper-express/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserGetAllRequestEvent } from '@src/modules/Users/events/UserGetAllRequestEvent';

const getAll: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users',
    method: 'get',

    async handler(req: Request, res: Response) {
      try {
        const queryString = req.query as Record<string, any> || {};
        if (!queryString.page) queryString.page = 1;
        const {
          result, error, page, size, total
        } = await controller!.getAll!(new UserGetAllRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          queryString
        }));
        // console.log({ error });
        if (error) throw error;
        return res.status(200).json({
          result, error, page, size, total
        });
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default getAll;
