import localhostGetHandlerFactory from '@src/interface/HTTP/adapters/fastify/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/interface/HTTP/adapters/fastify/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/interface/HTTP/adapters/fastify/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
