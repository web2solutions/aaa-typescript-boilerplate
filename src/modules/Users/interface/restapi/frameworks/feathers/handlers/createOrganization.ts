import { FeathersRequest, FeathersResponse } from '@src/interface/HTTP/adapters/feathers/FeathersServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/feathers/responses/sendErrorResponse';

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
    async handler(req: FeathersRequest, res: FeathersResponse) {
      try {
        const domainEvent = new OrganizationCreateRequestEvent({
          authorization: req.headers.authorization ?? '',
          input: req.body,
          schemaOAS: endPointConfig
        });
        const { result, error } = await controller!.createOrganization!(domainEvent);
        if (error) throw error;
        return res.status(201).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default createOrganization;
