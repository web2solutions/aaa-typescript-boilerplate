import { Request, Response } from 'restify';
import { _DOCS_PREFIX_ } from '@src/config/constants';
import { IbaseHandler, EndPointFactory, IHandlerFactory } from '@src/interface/HTTP/ports';

const apiVersionsGetHandlerFactory: EndPointFactory = (
  { apiDocs }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/versions',
    method: 'get',
    async handler(req: Request, res: Response): Promise<any> {
      const versions: Record<string, string> = {};
      if (typeof apiDocs !== 'undefined') {
        for (const [version] of apiDocs) {
          versions[version] = `${_DOCS_PREFIX_}/${version}`;
        }
      }
      res.status(200);
      return res.json({ versions });
    }
  };
};

export default apiVersionsGetHandlerFactory;
