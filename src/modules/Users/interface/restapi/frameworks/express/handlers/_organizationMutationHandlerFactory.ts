import { Request, Response } from 'express';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/express/responses/sendErrorResponse';
import { BaseDomainEvent } from '@src/modules/port/BaseDomainEvent';
import { OrganizationController } from '@src/modules/Users';
import {
  EndPointFactory,
  IHandlerFactory,
  IbaseHandler
} from '@src/interface/HTTP/ports';

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
      async handler(req: Request, res: Response) {
        try {
          const params = req.params as Record<string, any>;
          const domainEvent = new EventClass({
            authorization: req.headers.authorization ?? '',
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
