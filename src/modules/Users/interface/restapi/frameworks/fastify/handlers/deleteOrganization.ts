import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { OrganizationDeleteRequestEvent } from '@src/modules/Users/events/OrganizationDeleteRequestEvent';

const deleteOrganization: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/organizations/{id}',
    method: 'delete',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const params = req.params as Record<string, any>;
        const domainEvent = new OrganizationDeleteRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          params
        });
        const { result, error } = await controller!.deleteOrganization!(domainEvent);
        if (error) throw error;
        res.code(200);
        return result;
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default deleteOrganization;
