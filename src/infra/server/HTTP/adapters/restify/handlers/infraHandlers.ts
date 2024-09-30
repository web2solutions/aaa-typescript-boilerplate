import localhostGetHandlerFactory from '@src/infra/server/HTTP/adapters/restify/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/infra/server/HTTP/adapters/restify/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/infra/server/HTTP/adapters/restify/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
