import HyperExpress from 'hyper-express';
import LiveDirectory from 'live-directory';
// import bodyParser from 'body-parser';
import cors from 'cors';
// import helmet from 'helmet';
import path from 'node:path';
import { _HTTP_PORT_ } from '@src/infra/config/constants';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { HTTPBaseServer } from '@src/infra/server/HTTP/ports/HTTPBaseServer';

const LiveAssets = new LiveDirectory(path.join(__dirname, '../../../../../../doc'), {
  static: true,
  cache: {
    max_file_count: 200,
    max_file_size: 1024 * 1024 * 2.5
  }
});

class HyperExpressServer extends HTTPBaseServer<HyperExpress.Server> {
  private _application: HyperExpress.Server;

  constructor() {
    super();
    this._application = new HyperExpress.Server();
    this._application.use(cors());
    // this._application.use('/*', helmet());
    // https://github.com/kartikk221/hyper-express-body-parser
    this.createDocEndPoint();
  }

  get application(): HyperExpress.Server {
    return this._application;
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      if (handlerFactory.securitySchemes) {
        (this._application as any)[handlerFactory.method](
          handlerFactory.path,
          {
            middlewares: [handlerFactory.securitySchemes]
          },
          handlerFactory.handler
        );
        return;
      }
      (this._application as any)[handlerFactory.method](
        handlerFactory.path,
        handlerFactory.handler
      );
    } catch (error) {
      // console.log(error);
    }
  }

  private createDocEndPoint() {
    this._application.get('/doc/*', (request: HyperExpress.Request, response: HyperExpress.Response) => {
      try {
        const filePath = request.path.replace('/doc/', '');
        const file = LiveAssets.get(filePath);
        if (file === undefined) return response.status(404).json({ message: 'file not found' });
        const fileParts = file.path.split('.');
        const extension = fileParts[fileParts.length - 1];
        const { content } = file;
        if (content instanceof Buffer) {
          // deepcode ignore XSS: <please specify a reason of ignoring this>
          return response.type(extension).send(content);
        }
        return response.type(extension).stream(content);
      } catch (error: any) {
        return response.status(500).json({ message: error.message, error });
      }
    });
  }

  public async start(): Promise<void> {
    try {
      await this._application.listen(_HTTP_PORT_);
      // eslint-disable-next-line no-console
      console.log(`HyperExpress App Listening on Port ${_HTTP_PORT_}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`An error occurred: ${JSON.stringify(error)}`);
      this.stop(1);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public stop(code: number = 0) {
    process.exit(code);
  }
}

export { HyperExpressServer };
