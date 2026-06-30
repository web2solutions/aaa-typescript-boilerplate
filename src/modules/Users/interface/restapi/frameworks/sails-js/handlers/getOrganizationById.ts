import { SailsJsRequest, SailsJsResponse } from '@src/interface/HTTP/adapters/sails-js/SailsJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/sails-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { OrganizationGetOneRequestEvent } from '@src/modules/Users/events/OrganizationGetOneRequestEvent';

const getOrganizationById: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/organizations/{id}',
    method: 'get',
    async handler(req: SailsJsRequest, res: SailsJsResponse) {
      try {
        const params = req.params as Record<string, any>;
        const domainEvent = new OrganizationGetOneRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          params
        });
        const { result, error } = await controller!.getOrganizationById!(domainEvent);
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default getOrganizationById;
