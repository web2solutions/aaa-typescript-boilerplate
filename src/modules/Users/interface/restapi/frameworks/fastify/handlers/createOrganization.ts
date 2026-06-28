import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { OrganizationCreateRequestEvent } from '@src/modules/Users/events/OrganizationCreateRequestEvent';

const createOrganization: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/organizations',
    method: 'post',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const domainEvent = new OrganizationCreateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: req.body,
          schemaOAS: endPointConfig
        });
        const { result, error } = await controller!.createOrganization!(domainEvent);
        if (error) throw error;
        res.code(201);
        return result;
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default createOrganization;
