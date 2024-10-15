import restify from 'restify';
import bunyan from 'bunyan';
import { _HTTP_PORT_ } from '@src/config/constants';
import { IbaseHandler } from '@src/interface/HTTP/ports/IbaseHandler';
import { HTTPBaseServer } from '@src/interface/HTTP/ports/HTTPBaseServer';
import path from 'path';
import { Context } from '@src/infra/context/Context';
import { v4 } from 'uuid';
import { BaseError } from '@src/infra/exceptions';

type Restify = restify.Server;

class RestifyServer extends HTTPBaseServer<Restify> {
  public readonly application: Restify;

  constructor() {
    super();
    this.application = restify.createServer({
      log: bunyan.createLogger({
        name: 'api',
        streams: [{
          stream: process.stdout,
          level: bunyan.FATAL + 1
        }]
      })
    });
    // this.application.use(cors());
    // this.application.use(helmet());
    this.application.use(restify.plugins.gzipResponse());
    this.application.use(restify.plugins.queryParser());
    this.application.use(restify.plugins.urlEncodedBodyParser());
    this.application.use(restify.plugins.dateParser());
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
    // this.application.use(bodyParser.json({ limit: '100mb' }));
    // this.application.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
    this.createDocEndPoint();
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    const { method, handler } = handlerFactory;
    let verb = method;
    try {
      /* if (handlerFactory.securitySchemes) {
        (this.application as any)[method](
          handlerFactory.path,
          handlerFactory.securitySchemes,
          handler
        );
        return;
      } */
      if (verb === 'delete') {
        verb = 'del';
      }
      (this.application as any)[verb](handlerFactory.path, handler);
    } catch (error) {
      // eslint-disable-next-line no-console
      // console.log(error);
    }
  }

  private createDocEndPoint() {
    this.application.get('/OASdoc/*', restify.plugins.serveStatic({
      directory: path.join(__dirname, '../../../../../..'),
      default: 'index.html'
    }));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.application.listen(_HTTP_PORT_, () => {
          // eslint-disable-next-line no-console
          console.log(`Restify App Listening on Port ${_HTTP_PORT_}`);
          resolve();
        });
      } catch (error) {
        // console.error(`An error occurred: ${JSON.stringify(error)}`);
        this.stop();
        reject(new Error((error as BaseError).message));
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public stop(): Promise<void> {
    this.application.close();
    process.exit(0);
  }
}

export { RestifyServer };
