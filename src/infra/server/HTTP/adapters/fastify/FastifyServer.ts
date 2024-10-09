import fastify /* , { FastifyRequest, FastifyReply } */ from 'fastify';
import cors from '@fastify/cors';
// import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import formBody from '@fastify/formbody';
import path from 'node:path';
// import { Context } from '@src/infra/context/Context';

import { _HTTP_PORT_ } from '@src/infra/config/constants';
import { IbaseHandler } from '@src/infra/server/HTTP/ports/IbaseHandler';
import { HTTPBaseServer } from '@src/infra/server/HTTP/ports/HTTPBaseServer';

const fastifyApp = fastify({
  bodyLimit: 1048576 * 100 // 100mb
});
export type Fastify = typeof fastifyApp;

class FastifyServer extends HTTPBaseServer<Fastify> {
  private _application: Fastify;

  constructor() {
    super();
    this._application = fastifyApp;
    this._application.register(cors, {});
    /* this._application.register(helmet, {
      contentSecurityPolicy: {
        useDefaults: false
      }
    }); */
    this._application.register(formBody);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    /* await this._application.register(require('middie'));

    this._application.use((req: FastifyRequest, res: FastifyReply, next: any) => {
      const store = new Map();
      Context.run(store, () => {
        store.set('correlationId', v4());
        store.set('timeStart', +new Date());
        store.set('request', req);
        store.set('authorization', req.headers.authorization || '');

        // requestLogger('request started');
        next();
      });
    }); */

    this.createDocEndPoint();
  }

  get application(): Fastify {
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
    this._application.register(fastifyStatic, {
      root: path.join(__dirname, '../../../../../../doc'),
      prefix: '/doc/'
    });
  }

  public async start(): Promise<void> {
    try {
      await this._application.listen({ port: _HTTP_PORT_ });
      // eslint-disable-next-line no-console
      console.log(`Fastify App Listening on Port ${_HTTP_PORT_}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`An error occurred: ${JSON.stringify(error)}`);
      this.stop();
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public async stop(/* code: number = 0 */) {
    this._application.close();
    // process.exit(code);
  }
}

export { FastifyServer };
