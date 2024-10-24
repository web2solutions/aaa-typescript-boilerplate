import HyperExpress from 'hyper-express';
import LiveDirectory from 'live-directory';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import helmet from 'helmet';
import path from 'node:path';
import { _HTTP_PORT_ } from '@src/config/constants';
import { IbaseHandler, HTTPBaseServer } from '@src/interface/HTTP/ports';
import { Context } from '@src/infra/context/Context';
import { v4 } from 'uuid';

const LiveAssets = new LiveDirectory(path.join(__dirname, '../../../../../OASdoc'), {
  static: true,
  cache: {
    max_file_count: 200,
    max_file_size: 1024 * 1024 * 2.5
  }
});

let hyperExpressServer: any;
class HyperExpressServer extends HTTPBaseServer<HyperExpress.Server> {
  public readonly application: HyperExpress.Server;

  constructor() {
    super();
    this.application = new HyperExpress.Server();
    // this.application.use(cors());
    // this.application.use('/*', helmet());
    // https://github.com/kartikk221/hyper-express-body-parser
    this.application.use((req, res, next) => {
      const store = new Map();
      Context.run(store, () => {
        store.set('correlationId', v4());
        store.set('timeStart', +new Date());
        store.set('request', req);
        store.set('authorization', req.headers.authorization || '');

        // requestLogger('request started');
        next();
      });
    });
    this.createDocEndPoint();
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      (this.application as any)[handlerFactory.method](
        handlerFactory.path,
        handlerFactory.handler
      );
    } catch (error) {
      // console.log(error);
    }
  }

  private createDocEndPoint() {
    this.application.get('/OASdoc/*', (request: HyperExpress.Request, response: HyperExpress.Response) => {
      try {
        const filePath = request.path.replace('/OASdoc/', '');
        const file = LiveAssets.get(filePath);
        if (file === undefined) return response.status(404).json({ message: 'file not found' });
        const fileParts = file.path.split('.');
        const extension = fileParts[fileParts.length - 1];
        const { content } = file;
        // if (content instanceof Buffer) {
        // deepcode ignore XSS: <please specify a reason of ignoring this>
        return response.type(extension).send(content);
        // }
        // return response.type(extension).stream(content);
      } catch (error: any) {
        return response.status(500).json({ message: error.message, error });
      }
    });
  }

  public async start(): Promise<void> {
    try {
      await this.application.listen(_HTTP_PORT_);
      // eslint-disable-next-line no-console
      console.log(`HyperExpress App Listening on Port ${_HTTP_PORT_}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`An error occurred: ${JSON.stringify(error)}`);
      this.stop();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop(): Promise<void> {
    await Promise.resolve(this.application.close());
  }

  public static compile(): HTTPBaseServer<HyperExpress.Server> {
    if (!hyperExpressServer) {
      hyperExpressServer = new HyperExpressServer();
    }
    return hyperExpressServer;
  }
}

export { HyperExpressServer };
