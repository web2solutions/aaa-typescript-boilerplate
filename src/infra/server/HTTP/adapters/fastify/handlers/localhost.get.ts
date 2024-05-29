// import { FastifyRequest, FastifyReply } from 'fastify';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';

const localhostGetHandlerFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    async handler(): Promise<any> {
      return { status: 'ok' };
    }
  };
};

export default localhostGetHandlerFactory;
