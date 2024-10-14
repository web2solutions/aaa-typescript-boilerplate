/* eslint-disable import/no-extraneous-dependencies */
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { v4 } from 'uuid';
import { _HTTP_PORT_ } from '@src/config/constants';
import { HTTPBaseServer, IbaseHandler } from '@src/interface/HTTP/ports';
import { Context } from '@src/infra/context/Context';
import { InternalServerError } from '@src/infra/exceptions';

class ExpressServer extends HTTPBaseServer<Express> {
  private _application: Express;

  constructor() {
    super();
    this._application = express();
    this._application.use(cors());
    this._application.use(helmet());
    this._application.use(bodyParser.json({ limit: '100mb' }));

    this._application.use((req, res, next) => {
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
    // this._application.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
    this.createDocEndPoint();
  }

  get application(): Express {
    return this._application;
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      (this._application as any)[handlerFactory.method](
        handlerFactory.path,
        handlerFactory.handler
      );
    } catch (error) {
      // console.log(error);
    }
  }

  private createDocEndPoint() {
    this._application.use('/doc', express.static('doc'));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._application.listen(_HTTP_PORT_, () => {
          // eslint-disable-next-line no-console
          console.log(`Express App Listening on Port ${_HTTP_PORT_}`);
          resolve();
        });
      } catch (error) {
        // console.error(`An error occurred: ${JSON.stringify(error)}`);
        this.stop();
        reject(new InternalServerError((error as Error).message));
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public stop(): Promise<void> {
    // this._application.
    process.exit(0);
  }
}

export { ExpressServer };
