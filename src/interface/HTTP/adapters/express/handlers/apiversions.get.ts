import { Request, Response } from 'express';
import { _DOCS_PREFIX_ } from '@src/config/constants';
import { IbaseHandler, EndPointFactory, IHandlerFactory } from '@src/interface/HTTP/ports';

const apiVersionsGetHandlerFactory: EndPointFactory = (
  { apiDocs }: IHandlerFactory
): IbaseHandler => {
  return {
    path: '/versions',
    method: 'get',
    handler(req: Request, res: Response): void {
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
