import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

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
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default register;
