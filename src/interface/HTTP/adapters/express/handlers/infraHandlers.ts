import localhostGetHandlerFactory from '@src/interface/HTTP/adapters/express/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/interface/HTTP/adapters/express/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/interface/HTTP/adapters/express/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
