import { FastifyRequest, FastifyReply } from 'fastify';
import { _DOCS_PREFIX_ } from '@src/infra/config/constants';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { EndPointFactory } from '@src/infra/server/HTTP/ports/EndPointFactory';
import { IHandlerFactory } from '../../../ports/IHandlerFactory';

const apiVersionsGetHandlerFactory: EndPointFactory = (
  { apiDocs }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/versions',
    method: 'get',
    handler(req: FastifyRequest, res: FastifyReply): void {
      const versions: Record<string, string> = {};
      if (typeof apiDocs !== 'undefined') {
        for (const [version] of apiDocs) {
          versions[version] = `${_DOCS_PREFIX_}/${version}`;
        }
      }
      res.code(200).send({ versions });
    }
  };
};

export default apiVersionsGetHandlerFactory;
