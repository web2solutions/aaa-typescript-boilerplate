import type { VercelFunctionsRequest, VercelFunctionsResponse } from '@src/interface/HTTP/adapters/vercel-functions/vercel-functions';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/vercel-functions/responses/sendErrorResponse';

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
    async handler(req: VercelFunctionsRequest, res: VercelFunctionsResponse) {
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
