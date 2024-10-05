import restify from 'restify';
import bunyan from 'bunyan';
import { _HTTP_PORT_ } from '@src/infra/config/constants';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { HTTPBaseServer } from '@src/infra/server/HTTP/ports/HTTPBaseServer';
import path from 'path';

type Restify = restify.Server;

class RestifyServer extends HTTPBaseServer<Restify> {
  private _application: Restify;

  constructor() {
    super();
    this._application = restify.createServer({
      log: bunyan.createLogger({
        name: 'api',
        streams: [{
          stream: process.stdout,
          level: bunyan.FATAL + 1
        }]
      })
    });
    // this._application.use(cors());
    // this._application.use(helmet());
    this._application.use(restify.plugins.gzipResponse());
    this._application.use(restify.plugins.queryParser());
    this._application.use(restify.plugins.urlEncodedBodyParser());
    this._application.use(restify.plugins.dateParser());
    // this._application.use(bodyParser.json({ limit: '100mb' }));
    // this._application.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
    this.createDocEndPoint();
  }

  get application(): Restify {
    return this._application;
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    const { method, handler } = handlerFactory;
    let verb = method;
    try {
      /* if (handlerFactory.securitySchemes) {
        (this._application as any)[method](
          handlerFactory.path,
          handlerFactory.securitySchemes,
          handler
        );
        return;
      } */
      if (verb === 'delete') {
        verb = 'del';
      }
      (this._application as any)[verb](handlerFactory.path, handler);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  private createDocEndPoint() {
    this._application.get('/doc/*', restify.plugins.serveStatic({
      directory: path.join(__dirname, '../../../../../..'),
      default: 'index.html'
    }));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._application.listen(_HTTP_PORT_, () => {
          // eslint-disable-next-line no-console
          console.log(`Restify App Listening on Port ${_HTTP_PORT_}`);
          resolve();
        });
      } catch (error) {
        // console.error(`An error occurred: ${JSON.stringify(error)}`);
        this.stop();
        reject(new Error((error as Error).message));
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public stop(): Promise<void> {
    this._application.close();
    process.exit(0);
  }
}

export { RestifyServer };
