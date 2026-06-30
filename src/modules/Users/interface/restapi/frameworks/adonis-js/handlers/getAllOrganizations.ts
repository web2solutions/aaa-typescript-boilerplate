import { AdonisJsRequest, AdonisJsResponse } from '@src/interface/HTTP/adapters/adonis-js/AdonisJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/adonis-js/responses/sendErrorResponse';

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
    async handler(req: AdonisJsRequest, res: AdonisJsResponse) {
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
        return res.status(200).json({
          result, error, page, size, total
        });
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default getAllOrganizations;
