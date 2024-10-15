import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
// import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import formBody from '@fastify/formbody';
import path from 'node:path';
import { v4 } from 'uuid';

import { _HTTP_PORT_ } from '@src/config/constants';
import { IbaseHandler, HTTPBaseServer } from '@src/interface/HTTP/ports';
import { Context } from '@src/infra/context/Context';

const fastifyApp = fastify({
  bodyLimit: 1048576 * 100 // 100mb
});
export type Fastify = typeof fastifyApp;

class FastifyServer extends HTTPBaseServer<Fastify> {
  public readonly application: Fastify;

  constructor() {
    super();
    this.application = fastifyApp;
    this.application.register(cors, {});
    /* this.application.register(helmet, {
      contentSecurityPolicy: {
        useDefaults: false
      }
    }); */
    this.application.register(formBody);
    (this.application as any).addHook('preHandler', (req: FastifyRequest, res: FastifyReply, next: any) => {
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
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    /* await this.application.register(require('middie'));

    this.application.use((req: FastifyRequest, res: FastifyReply, next: any) => {
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
    this.application.register(fastifyStatic, {
      root: path.join(__dirname, '../../../../../../OASdoc'),
      prefix: '/OASdoc/'
    });
  }

  public async start(): Promise<void> {
    try {
      await this.application.listen({ port: _HTTP_PORT_ });
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
    this.application.close();
    // process.exit(code);
  }
}

export { FastifyServer };
