import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserEmailDeleteRequestEvent, UserController } from '@src/modules/Users';

const deleteEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deleteEmail/{emailId}',
    method: 'delete',

    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = JSON.parse(JSON.stringify(req.params));
        const { result, error } = await (controller! as UserController)
          .deleteEmail(new UserEmailDeleteRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default deleteEmail;
