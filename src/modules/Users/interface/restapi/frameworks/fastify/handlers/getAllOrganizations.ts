import { FastifyRequest, FastifyReply } from 'fastify';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/fastify/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { OrganizationGetAllRequestEvent } from '@src/modules/Users/events/OrganizationGetAllRequestEvent';

const getAllOrganizations: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/organizations',
    method: 'get',
    async handler(req: FastifyRequest, res: FastifyReply) {
      try {
        const queryString = req.query as Record<string, any> || {};
        if (!queryString.page) queryString.page = 1;
        const {
          result, error, page, size, total
        } = await controller!.getAllOrganizations!(new OrganizationGetAllRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          queryString
        }));
        if (error) throw error;
        res.code(200);
        return {
          result, error, page, size, total
        };
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default getAllOrganizations;
