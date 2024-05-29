import localhostGetHandlerFactory from '@src/infra/server/HTTP/adapters/express/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/infra/server/HTTP/adapters/express/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/infra/server/HTTP/adapters/express/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
