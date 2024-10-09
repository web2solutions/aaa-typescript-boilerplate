import { FastifyRequest, FastifyReply } from 'fastify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';

import { UpdatePasswordRequestEvent } from '@src/infra/auth/events/UpdatePasswordRequestEvent';
import { IUpdatePasswordRequest } from '@src/infra/auth/dto/IUpdatePasswordRequest';

const updatePassword: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/auth/updatePassword',
    method: 'post',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const { result, error } = await controller!.updatePassword!(
          new UpdatePasswordRequestEvent<IUpdatePasswordRequest>({
            authorization: req.headers.authorization ?? '',
            input: req.body as IUpdatePasswordRequest,
            schemaOAS: endPointConfig
          })
        );
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default updatePassword;
