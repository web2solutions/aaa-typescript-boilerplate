import { EndPointFactory, IbaseHandler } from '@src/infra/server/HTTP/ports';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    async handler(): Promise<any> {
      return { status: 'result' };
    }
  };
};

export default localhostGetHandlerFactory;
