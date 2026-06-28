import { TotalJsRequest, TotalJsResponse } from '@src/interface/HTTP/adapters/total-js/TotalJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/total-js/responses/sendErrorResponse';

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
    async handler(req: TotalJsRequest, res: TotalJsResponse) {
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
