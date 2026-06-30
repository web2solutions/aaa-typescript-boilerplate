import { BaseError, EErrorStringCodes } from '@src/infra/exceptions';
import { formatErrorMessage, toHttpStatus } from '@src/shared/utils';
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { OrganizationController } from '@src/modules/Users';
import {
  EndPointFactory,
  IHandlerFactory,
  IbaseHandler
} from '@src/interface/HTTP/ports';

import { SailsJsRequest, SailsJsResponse } from '@src/interface/HTTP/adapters/sails-js/SailsJsServer';

type ControllerMethod =
  | 'createOrganizationAddress'
  | 'updateOrganizationAddress'
  | 'deleteOrganizationAddress'
  | 'createOrganizationPhone'
  | 'updateOrganizationPhone'
  | 'deleteOrganizationPhone'
  | 'createOrganizationEmail'
  | 'updateOrganizationEmail'
  | 'deleteOrganizationEmail';

type OrganizationMutationHandlerFactoryConfig = {
  path: string;
  method: IbaseHandler['method'];
  statusCode: number;
  EventClass: new (message: Record<string, any>) => BaseDomainEvent;
  controllerMethod: ControllerMethod;
  withBody?: boolean;
};

function sendErrorResponse(error: BaseError, res: SailsJsResponse) {
  return res.status(toHttpStatus(error.code as EErrorStringCodes) || 500).json({
    message: formatErrorMessage(error),
    error
  });
}

export const createOrganizationMutationHandler = (
  config: OrganizationMutationHandlerFactoryConfig
): EndPointFactory => {
  const {
    path,
    method,
    statusCode,
    EventClass,
    controllerMethod,
    withBody = true
  } = config;

  return ({ endPointConfig, controller }: IHandlerFactory): IbaseHandler => {
    return {
      path,
      method,
      async handler(req: SailsJsRequest, res: SailsJsResponse) {
        try {
          const params = (req.params || {}) as Record<string, any>;
          const domainEvent = new EventClass({
            authorization: req.headers?.authorization ?? '',
            params,
            input: withBody ? req.body : undefined,
            schemaOAS: endPointConfig
          });
          const { result, error } = await (controller! as OrganizationController)[controllerMethod](
            domainEvent
          );
          if (error) throw error;
          return res.status(statusCode).json(result);
        } catch (error: any) {
          return sendErrorResponse(error, res);
        }
      }
    };
  };
};
