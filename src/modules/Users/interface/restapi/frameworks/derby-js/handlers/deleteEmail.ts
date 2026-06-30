import { DerbyJsRequest, DerbyJsResponse } from '@src/interface/HTTP/adapters/derby-js/DerbyJsServer';
import { sendErrorResponse } from '@src/interface/HTTP/adapters/derby-js/responses/sendErrorResponse';

import {
  IHandlerFactory,
  IbaseHandler,
  EndPointFactory
} from '@src/interface/HTTP/ports';

import { UserController, UserEmailDeleteRequestEvent } from '@src/modules/Users';

const deleteEmail: EndPointFactory = (
  {
    endPointConfig,
    controller
  }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/users/{id}/deleteEmail/{emailId}',
    method: 'delete',

    async handler(req: DerbyJsRequest, res: DerbyJsResponse) {
      try {
        const params = req.params as Record<string, any>;
        const { result, error } = await (controller! as UserController)
          .deleteEmail(new UserEmailDeleteRequestEvent({
            authorization: req.headers.authorization ?? '',
            params,
            schemaOAS: endPointConfig
          }));
        if (error) throw error;
        return res.status(200).json(result);
      } catch (error: any) {
        return sendErrorResponse(error, res);
      }
    }
  };
};

export default deleteEmail;
