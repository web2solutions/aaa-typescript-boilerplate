import type { VercelFunctionsRequest, VercelFunctionsResponse } from '@src/interface/HTTP/adapters/vercel-functions/vercel-functions';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/vercel-functions/responses/sendErrorResponse';

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
    async handler(req: VercelFunctionsRequest, res: VercelFunctionsResponse) {
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
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default updateOrganization;
