import localhostGetHandlerFactory from '@src/interface/HTTP/adapters/hyper-express/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/interface/HTTP/adapters/hyper-express/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/interface/HTTP/adapters/hyper-express/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
