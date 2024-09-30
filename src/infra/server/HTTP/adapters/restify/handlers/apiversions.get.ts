import { Request, Response, Next } from 'restify';
import { _DOCS_PREFIX_ } from '@src/infra/config/constants';
import { IbaseHandler, EndPointFactory, IHandlerFactory } from '@src/infra/server/HTTP/ports';

const apiVersionsGetHandlerFactory: EndPointFactory = (
  { apiDocs }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/versions',
    method: 'get',
    handler(req: Request, res: Response, next: Next): void {
      const versions: Record<string, string> = {};
      if (typeof apiDocs !== 'undefined') {
        for (const [version] of apiDocs) {
          versions[version] = `${_DOCS_PREFIX_}/${version}`;
        }
      }
      res.status(200);
      res.json({ versions });

      return next();
    }
  };
};

export default apiVersionsGetHandlerFactory;
