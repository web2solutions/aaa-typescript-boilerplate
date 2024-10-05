import { FastifyRequest, FastifyReply } from 'fastify';
import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory,
  UserController
} from '@src/infra/server/HTTP';
import {
  sendErrorResponse
} from '@src/infra/server/HTTP/adapters/fastify/responses/sendErrorResponse';
import { UserEmailUpdateRequestEvent } from '@src/domains/Users/events/UserEmailUpdateRequestEvent';
import { RequestUpdateEmail } from '@src/domains/Users';

const updateEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/updateEmail/{emailId}',
    method: 'put',

    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = JSON.parse(JSON.stringify(req.params));
        const { result, error } = await (controller! as UserController)
          .updateEmail(new UserEmailUpdateRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            input: req.body as RequestUpdateEmail,
            schemaOAS: endPointConfig
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

export default updateEmail;
