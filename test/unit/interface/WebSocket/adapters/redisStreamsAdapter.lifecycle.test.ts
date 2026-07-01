/* eslint-disable jest/no-untyped-mock-factory */
import { Server } from 'socket.io';

const connectMock = jest.fn();
const quitMock = jest.fn();
const createClientMock = jest.fn();
const createAdapterMock = jest.fn();

jest.mock('redis', () => ({
  createClient: (...args: any[]) => createClientMock(...args)
}));

jest.mock('@socket.io/redis-streams-adapter', () => ({
  createAdapter: (...args: any[]) => createAdapterMock(...args)
}));

describe('redisStreamsAdapter lifecycle', () => {
  beforeEach(() => {
    connectMock.mockReset();
    quitMock.mockReset();
    createClientMock.mockReset();
    createAdapterMock.mockReset();
  });

  it('configures socket.io adapter and connects redis when client is closed', async () => {
    expect.hasAssertions();
    const io = { adapter: jest.fn() } as unknown as Server;
    const fakeRedisClient = { isOpen: false, connect: connectMock, quit: quitMock };
    const fakeAdapter = jest.fn();
    createClientMock.mockReturnValue(fakeRedisClient);
    createAdapterMock.mockReturnValue(fakeAdapter);
    const { createRedisStreamsSocketIoAdapter } = await import('@src/interface/WebSocket/adapters/socket-io/redisStreamsAdapter');

    const adapter = createRedisStreamsSocketIoAdapter();
    await adapter.configure(io);

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(createAdapterMock).toHaveBeenCalledWith(fakeRedisClient);
    expect((io.adapter as any)).toHaveBeenCalledWith(fakeAdapter);
  });

  it('skips connect when redis client is already open and quits on cleanup', async () => {
    expect.hasAssertions();
    const io = { adapter: jest.fn() } as unknown as Server;
    const fakeRedisClient = { isOpen: true, connect: connectMock, quit: quitMock };
    createClientMock.mockReturnValue(fakeRedisClient);
    createAdapterMock.mockReturnValue(jest.fn());
    const { createRedisStreamsSocketIoAdapter } = await import('@src/interface/WebSocket/adapters/socket-io/redisStreamsAdapter');

    const adapter = createRedisStreamsSocketIoAdapter();
    await adapter.configure(io);
    await adapter.cleanup();

    expect(connectMock).toHaveBeenCalledTimes(0);
    expect(quitMock).toHaveBeenCalledTimes(1);
  });
});
