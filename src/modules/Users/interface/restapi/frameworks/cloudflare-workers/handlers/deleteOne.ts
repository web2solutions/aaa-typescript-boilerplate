import type { CloudflareWorkersRequest, CloudflareWorkersResponse } from '@src/interface/HTTP/adapters/cloudflare-workers/cloudflare-workers';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/cloudflare-workers/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserDeleteRequestEvent } from '@src/modules/Users/events/UserDeleteRequestEvent';

const deleteOne: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}',
    method: 'delete',
    async handler(req: CloudflareWorkersRequest, res: CloudflareWorkersResponse) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await controller!.delete!(new UserDeleteRequestEvent({
          authorization: req.headers.authorization ?? '',
          schemaOAS: endPointConfig,
          params
        }));
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default deleteOne;
