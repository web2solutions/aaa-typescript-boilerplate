import { FastifyRequest, FastifyReply } from 'fastify';
import { _DOCS_PREFIX_ } from '@src/config/constants';
import { IbaseHandler, EndPointFactory, IHandlerFactory } from '@src/interface/HTTP/ports';

const apiVersionsGetHandlerFactory: EndPointFactory = (
  { apiDocs }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/versions',
    method: 'get',
    async handler(req: FastifyRequest, res: FastifyReply): Promise<any> {
      const versions: Record<string, string> = {};
      if (typeof apiDocs !== 'undefined') {
        for (const [version] of apiDocs) {
          versions[version] = `${_DOCS_PREFIX_}/${version}`;
        }
      }
      res.code(200);
      return Promise.resolve({ versions });
    }
  };
};

export default apiVersionsGetHandlerFactory;
