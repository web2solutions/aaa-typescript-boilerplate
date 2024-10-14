import { EndPointFactory, IbaseHandler } from '@src/interface/HTTP/ports';
import { Context } from '@src/infra/context/Context';

const localhostGetHandlerFactory: EndPointFactory = (): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    async handler(): Promise<any> {
      const store: Map<any, any> = Context.getStore() as Map<any, any>;
      return { status: 'result', correlationId: store.get('correlationId') };
    }
  };
};

export default localhostGetHandlerFactory;
