/* global describe, it, expect, beforeAll, afterAll */
import http from 'http';
import { AddressInfo } from 'net';
import { createClient } from 'redis';
import { Server as SocketIOServer } from 'socket.io';
import { io as createSocketClient, Socket } from 'socket.io-client';
import { createAdapter } from '@socket.io/redis-streams-adapter';

const REDIS_PASSWORD = process.env.AAA_REDIS_PASSWORD || 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81';
const REDIS_HOST = process.env.AAA_REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.AAA_REDIS_PORT || '6379';
const REDIS_DB = process.env.AAA_REDIS_DATABASE || '1';

const redisUrl = `redis://:${encodeURIComponent(REDIS_PASSWORD)}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;

interface IRunningNode {
  name: string;
  httpServer: http.Server;
  io: SocketIOServer;
  redisClient: ReturnType<typeof createClient>;
  port: number;
}

const connectClient = async (url: string): Promise<Socket> => {
  const socket = createSocketClient(url, {
    path: '/ws',
    transports: ['websocket'],
    forceNew: true
  });
  await new Promise<void>((resolve, reject) => {
    socket.on('connect', () => resolve());
    socket.on('connect_error', (error) => reject(error));
  });
  return socket;
};

const emitWithAck = (
  socket: Socket,
  eventName: string,
  payload: Record<string, any>,
  timeoutMs = 10000
): Promise<any> => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error(`ack timeout for ${eventName}`)), timeoutMs);
  socket.emit(eventName, payload, (arg1: any, arg2: any) => {
    clearTimeout(timeout);
    const hasErrorArg = arg2 !== undefined;
    const error = hasErrorArg ? arg1 : undefined;
    const ackPayload = hasErrorArg ? arg2 : arg1;
    if (error) {
      reject(error);
      return;
    }
    resolve(ackPayload);
  });
});

const waitForClusterResponse = (
  socket: Socket,
  requestId: string,
  timeoutMs = 15000
): Promise<any> => new Promise((resolve, reject) => {
  let timeout: NodeJS.Timeout;
  const onClusterResponse = (payload: any) => {
    if (payload?.requestId !== requestId) return;
    clearTimeout(timeout);
    socket.off('cluster:response', onClusterResponse);
    resolve(payload);
  };
  timeout = setTimeout(() => {
    socket.off('cluster:response', onClusterResponse);
    reject(new Error('cross-node response timeout'));
  }, timeoutMs);
  socket.on('cluster:response', onClusterResponse);
});

const startNode = async (name: string): Promise<IRunningNode> => {
  const httpServer = http.createServer();
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    transports: ['websocket'],
    cors: { origin: '*' }
  });
  const redisClient = createClient({ url: redisUrl });
  await redisClient.connect();
  io.adapter(createAdapter(redisClient));

  io.on('connection', (socket) => {
    socket.on('api:request', (payload, ack) => {
      const response = {
        ok: true,
        operationId: payload?.operationId || 'unknown',
        result: {
          servedBy: name,
          echoedInput: payload?.input || {}
        }
      };

      if (payload?.operationId === 'crossNodeBroadcast') {
        io.emit('cluster:response', {
          ok: true,
          sourceNode: name,
          requestId: payload?.metadata?.requestId
        });
      } else {
        socket.emit('api:response', response);
      }

      if (typeof ack === 'function') {
        ack(response);
      }
    });
  });

  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  const address = httpServer.address() as AddressInfo;

  return {
    name,
    httpServer,
    io,
    redisClient,
    port: address.port
  };
};

const stopNode = async (node: IRunningNode): Promise<void> => {
  await new Promise<void>((resolve) => {
    node.io.close(() => resolve());
  });
  await new Promise<void>((resolve) => {
    node.httpServer.close(() => resolve());
  });
  if (node.redisClient.isOpen) {
    await node.redisClient.quit();
  }
};

describe('socket.io redis-streams multi-instance resilience', () => {
  let nodeOne: IRunningNode;
  let nodeTwo: IRunningNode;
  let clientOne: Socket;
  let clientTwo: Socket;

  beforeAll(async () => {
    const probe = createClient({ url: redisUrl });
    await probe.connect();
    await probe.ping();
    await probe.quit();

    nodeOne = await startNode('node-one');
    nodeTwo = await startNode('node-two');

    clientOne = await connectClient(`ws://127.0.0.1:${nodeOne.port}`);
    clientTwo = await connectClient(`ws://127.0.0.1:${nodeTwo.port}`);
  }, 30000);

  afterAll(async () => {
    if (clientOne?.connected) clientOne.disconnect();
    if (clientTwo?.connected) clientTwo.disconnect();
    if (nodeOne) await stopNode(nodeOne);
    if (nodeTwo) await stopNode(nodeTwo);
  }, 30000);

  it('should handle request/response independently on each node', async () => {
    expect.hasAssertions();
    const responseOne = await emitWithAck(
      clientOne,
      'api:request',
      { operationId: 'ping', input: { value: 1 } }
    );
    const responseTwo = await emitWithAck(
      clientTwo,
      'api:request',
      { operationId: 'ping', input: { value: 2 } }
    );

    expect(responseOne.result.servedBy).toBe('node-one');
    expect(responseTwo.result.servedBy).toBe('node-two');
  });

  it('should propagate broadcast across nodes through redis streams adapter', async () => {
    expect.hasAssertions();
    const requestId = `cross-${Date.now()}`;
    const crossNodeEvent = waitForClusterResponse(clientTwo, requestId);

    const ack = await emitWithAck(
      clientOne,
      'api:request',
      {
        operationId: 'crossNodeBroadcast',
        metadata: { requestId }
      }
    );
    expect(ack.ok).toBe(true);

    const payload = await crossNodeEvent;
    expect(payload.ok).toBe(true);
    expect(payload.sourceNode).toBe('node-one');
    expect(payload.requestId).toBe(requestId);
  });
});
