/* eslint-disable import/no-extraneous-dependencies */
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
// import helmet from 'helmet';
import { _HTTP_PORT_ } from '@src/infra/config/constants';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { HTTPBaseServer } from '@src/infra/server/HTTP/ports/HTTPBaseServer';

class ExpressServer extends HTTPBaseServer<Express> {
  private _application: Express;

  constructor() {
    super();
    this._application = express();
    this._application.use(cors());
    // this._application.use(helmet());
    this._application.use(bodyParser.json({ limit: '100mb' }));
    // this._application.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
    this.createDocEndPoint();
  }

  get application(): Express {
    return this._application;
  }

  public endPointRegister(handlerFactory: IbaseHandler): void {
    try {
      if (handlerFactory.securitySchemes) {
        (this._application as any)[handlerFactory.method](
          handlerFactory.path,
          handlerFactory.securitySchemes,
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
    this._application.use('/doc', express.static('doc'));
  }

  public start(): Promise<string | Error> {
    return new Promise((resolve, reject) => {
      try {
        this._application.listen(_HTTP_PORT_, () => {
          // eslint-disable-next-line no-console
          console.log(`Express App Listening on Port ${_HTTP_PORT_}`);
          resolve('ok');
        });
      } catch (error) {
        // console.error(`An error occurred: ${JSON.stringify(error)}`);
        reject(new Error(`${error}`));
        this.stop();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public stop() {
    //     this._application.
    process.exit(0);
  }
}

export { ExpressServer };
