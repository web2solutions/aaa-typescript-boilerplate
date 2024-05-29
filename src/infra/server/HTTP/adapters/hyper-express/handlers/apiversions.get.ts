import HyperExpress from 'hyper-express';
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
    handler(req: HyperExpress.Request, res: HyperExpress.Response): void {
      const versions: Record<string, string> = {};
      if (typeof apiDocs !== 'undefined') {
        for (const [version] of apiDocs) {
          versions[version] = `${_DOCS_PREFIX_}/${version}`;
        }
      }
      res.status(200).json({ versions });
    }
  };
};

export default apiVersionsGetHandlerFactory;
