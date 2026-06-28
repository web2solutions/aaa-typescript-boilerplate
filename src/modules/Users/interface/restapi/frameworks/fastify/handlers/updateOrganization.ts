import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { OrganizationUpdateRequestEvent } from '@src/modules/Users/events/OrganizationUpdateRequestEvent';

const updateOrganization: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/organizations/{id}',
    method: 'put',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = req.params as Record<string, any>;
        const domainEvent = new OrganizationUpdateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: req.body,
          schemaOAS: endPointConfig,
          params
        });
        const { result, error } = await controller!.updateOrganization!(domainEvent);
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default updateOrganization;
