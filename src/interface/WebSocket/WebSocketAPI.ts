/* eslint-disable @typescript-eslint/no-explicit-any */

import http from 'http';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'crypto';

import { _HTTP_PORT_ } from '@src/config/constants';
import {
  IAsyncOperationRequest,
  IAsyncOperationResponse,
  IRealtimeAPIFactory,
  RealtimeAPIBase
} from '@src/interface/Async/RealtimeAPIBase';

export interface IWebSocketAPIFactory extends IRealtimeAPIFactory {
  host?: string;
  port?: number;
  path?: string;
  configureSocketIo?: (io: Server) => Promise<void> | void;
  cleanupSocketIo?: () => Promise<void> | void;
}

export class WebSocketAPI extends RealtimeAPIBase {
  private readonly host: string;

  private readonly port: number;

  private readonly path: string;

  private httpServer?: http.Server;

  private io?: Server;

  private readonly configureSocketIo?: (io: Server) => Promise<void> | void;

  private readonly cleanupSocketIo?: () => Promise<void> | void;

  constructor(config: IWebSocketAPIFactory) {
    super({
      ...config,
      interfaceType: 'websocketapi',
      frameworkName: 'socket-io'
    });
    this.host = config.host || '0.0.0.0';
    this.port = config.port || Number(process.env.AAA_WEBSOCKET_PORT || (_HTTP_PORT_ + 1));
    this.path = config.path || '/ws';
    this.configureSocketIo = config.configureSocketIo;
    this.cleanupSocketIo = config.cleanupSocketIo;
  }

  private async handleOperationRequest(
    request: IAsyncOperationRequest
  ): Promise<IAsyncOperationResponse> {
    return this.executeOperation(request);
  }

  private bindSocket(socket: Socket): void {
    socket.on(
      'api:request',
      async (
        request: IAsyncOperationRequest,
        ack?: (response: IAsyncOperationResponse) => void
      ) => {
        const requestId = request?.metadata?.requestId || randomUUID();
        const response = await this.handleOperationRequest({
          ...request,
          metadata: {
            ...(request.metadata || {}),
            requestId,
            clientId: socket.id
          }
        });
        const responseChannel = response?.metadata?.channel || `api:${response.operationId}:response`;
        const responsePayload = {
          ...response,
          metadata: {
            ...(response.metadata || {}),
            requestId,
            clientId: socket.id,
            channel: responseChannel
          }
        };
        socket.emit('api:response', responsePayload);
        socket.emit(responseChannel, responsePayload);
        if (typeof ack === 'function') {
          ack(responsePayload);
        }
      }
    );

    for (const operationId of this.listOperationIds()) {
      socket.on(
        `api:${operationId}:request`,
        async (
          request: Omit<IAsyncOperationRequest, 'operationId'>,
          ack?: (response: IAsyncOperationResponse) => void
        ) => {
          const requestId = request?.metadata?.requestId || randomUUID();
          const response = await this.handleOperationRequest({
            ...request,
            metadata: {
              ...(request.metadata || {}),
              requestId,
              clientId: socket.id
            },
            operationId
          });
          const responseChannel = response?.metadata?.channel || `api:${operationId}:response`;
          const responsePayload = {
            ...response,
            metadata: {
              ...(response.metadata || {}),
              requestId,
              clientId: socket.id,
              channel: responseChannel
            }
          };
          socket.emit(responseChannel, responsePayload);
          if (typeof ack === 'function') {
            ack(responsePayload);
          }
        }
      );
    }
  }

  public async start(): Promise<void> {
    if (this.started) return;

    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.connect();
    }
    await this.databaseClient.connect();

    this.httpServer = http.createServer();
    this.io = new Server(this.httpServer, {
      path: this.path,
      transports: ['websocket'],
      cors: {
        origin: '*'
      }
    });
    if (this.configureSocketIo) {
      await this.configureSocketIo(this.io);
    }

    this.io.on('connection', (socket) => {
      this.bindSocket(socket);
    });

    await new Promise<void>((resolve) => {
      this.httpServer!.listen(this.port, this.host, () => {
        resolve();
      });
    });

    this.started = true;
  }

  public async stop(): Promise<void> {
    if (!this.started) return;

    if (this.io) {
      this.io.close();
      this.io = undefined;
    }

    if (this.cleanupSocketIo) {
      await this.cleanupSocketIo();
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer!.close(() => resolve());
      });
      this.httpServer = undefined;
    }

    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.disconnect();
    }
    await this.databaseClient.disconnect();
    this.started = false;
  }
}

export default WebSocketAPI;
