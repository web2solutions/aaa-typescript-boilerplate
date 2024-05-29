import localhostGetHandlerFactory from '@src/infra/server/HTTP/adapters/fastify/handlers/localhost.get';
import apiVersionsGetHandlerFactory from '@src/infra/server/HTTP/adapters/fastify/handlers/apiversions.get';
import apiDocGetHandlerFactory from '@src/infra/server/HTTP/adapters/fastify/handlers/apiDocGetHandlerFactory';

export const infraHandlers = {
  localhostGetHandlerFactory,
  apiVersionsGetHandlerFactory,
  apiDocGetHandlerFactory
};
