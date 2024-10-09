import { FastifyRequest, FastifyReply } from 'fastify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { RegisterRequestEvent } from '@src/infra/auth/events/RegisterRequestEvent';
import { IRegisterRequest } from '@src/infra/auth/dto/IRegisterRequest';

const register: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/register',
    method: 'post',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const { result, error } = await controller!.register!(
          new RegisterRequestEvent<IRegisterRequest>({
            input: req.body as IRegisterRequest,
            schemaOAS: endPointConfig
          })
        );
        if (error) throw error;
        res.code(201);
        return result;
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default register;
