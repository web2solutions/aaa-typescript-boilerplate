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

let expressServer: any;

class ExpressServer extends HTTPBaseServer<Express> {
  public readonly application: Express;

  constructor() {
    super();
    this.application = express();
    this.application.use(cors());
    this.application.use(helmet());
    this.application.use(bodyParser.json({ limit: '100mb' }));

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
    // this.application.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
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
    this.application.use('/OASdoc', express.static('OASdoc'));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.application.listen(_HTTP_PORT_, () => {
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
    // this.application.
    process.exit(0);
  }

  public static compile(): HTTPBaseServer<Express> {
    if (!expressServer) {
      expressServer = new ExpressServer();
    }
    return expressServer;
  }
}

export { ExpressServer };
