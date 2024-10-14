import HyperExpress from 'hyper-express';
import { IbaseHandler } from '@src/interface/HTTP/ports/IbaseHandler';
import { EndPointFactory } from '@src/interface/HTTP/ports/EndPointFactory';
// import basicAuth from '../auth/basicAuth';

// eslint-disable-next-line no-empty-pattern
const localhostGetHandlerFactory: EndPointFactory = ({}): IbaseHandler => {
  return {
    path: '/',
    method: 'get',
    // securitySchemes: basicAuth,
    handler(req: HyperExpress.Request, res: HyperExpress.Response): void {
      res.status(200).json({ status: 'result' });
    }
  };
};

export default localhostGetHandlerFactory;
