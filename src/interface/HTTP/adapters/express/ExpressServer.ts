/* eslint-disable import/no-extraneous-dependencies */
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import { v4 } from 'uuid';
import { _HTTP_PORT_ } from '@src/config/constants';
import { isCorsOriginAllowed } from '@src/config/security';
import { HTTPBaseServer } from '@src/interface/HTTP/ports';
import { Context } from '@src/infra/context/Context';
import { InternalServerError } from '@src/infra/exceptions';
import { Server } from 'http';

let server: any;

class ExpressServer extends HTTPBaseServer<Express> {
  public readonly application: Express;

  private server: Server | undefined;

  constructor() {
    super();
    this.application = express();
    this.application.use(cors({
      origin(origin, callback) {
        if (isCorsOriginAllowed(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by CORS'));
      }
    }));
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

  private createDocEndPoint() {
    this.application.use('/OASdoc', express.static('OASdoc'));
    this.application.use('/AsyncAPIdoc', express.static('AsyncAPIdoc'));
    this.application.get('/docs/asyncapi', (_, res) => {
      res.redirect('/AsyncAPIdoc');
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const port = Number(process.env.AAA_HTTP_PORT || _HTTP_PORT_);
        this.server = this.application.listen(port, () => {
          // eslint-disable-next-line no-console
          console.log(`Express App Listening on Port ${port}`);
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
  public async stop(): Promise<void> {
    if (!this.server) {
      return;
    }
    await Promise.resolve(this.server.close());
    // process.exit(0);
  }

  public static compile(): HTTPBaseServer<Express> {
    if (!server) {
      server = new this();
    }
    return server;
  }
}

export { ExpressServer };
