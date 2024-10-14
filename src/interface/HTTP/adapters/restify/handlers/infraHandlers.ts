import localhostGetHandlerFactory from '@src/interface/HTTP/adapters/restify/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/interface/HTTP/adapters/restify/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/interface/HTTP/adapters/restify/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};