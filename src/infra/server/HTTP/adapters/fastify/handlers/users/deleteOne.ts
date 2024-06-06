import { FastifyRequest, FastifyReply } from 'fastify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/infra/server/HTTP';
import { sendErrorResponse } from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';
import { UserDeleteRequestEvent } from '@src/domains/Users/events/UserDeleteRequestEvent';

const deleteOne: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'delete',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await controller!.delete(new UserDeleteRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          params
        }));
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: unknown) {
        return sendErrorResponse(error as Error, res);
      }
    }
  };
};

export default deleteOne;
