import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { RequestCreateEmail, UserController, UserEmailCreateRequestEvent } from '@src/modules/Users';

const createEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/createEmail',
    method: 'post',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = JSON.parse(JSON.stringify(req.params));
        const { result, error } = await (controller! as UserController)
          .createEmail(new UserEmailCreateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestCreateEmail,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        res.code(201);
        return result;
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default createEmail;
