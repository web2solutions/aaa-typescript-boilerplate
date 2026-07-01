import {
  buildRedisConnectionUrl,
  isRedisStreamsSocketIoEnabled
} from '@src/interface/WebSocket/adapters/socket-io/redisStreamsAdapter';

describe('redisStreamsAdapter', () => {
  it('should enable redis streams adapter only when explicitly configured', () => {
    expect.hasAssertions();
    expect(isRedisStreamsSocketIoEnabled({
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'redis-streams'
    } as NodeJS.ProcessEnv)).toBe(true);

    expect(isRedisStreamsSocketIoEnabled({
      AAA_WEBSOCKET_SOCKETIO_ADAPTER: 'none'
    } as NodeJS.ProcessEnv)).toBe(false);
  });

  it('should prefer websocket specific redis url when provided', () => {
    expect.hasAssertions();
    const url = buildRedisConnectionUrl({
      AAA_WEBSOCKET_REDIS_URL: 'redis://10.0.0.9:6379/3',
      AAA_REDIS_URL: 'redis://10.0.0.1:6379/1'
    } as NodeJS.ProcessEnv);
    expect(url).toBe('redis://10.0.0.9:6379/3');
  });

  it('should fallback to global redis url when websocket url is not set', () => {
    expect.hasAssertions();
    const url = buildRedisConnectionUrl({
      AAA_REDIS_URL: 'redis://10.0.0.1:6379/1'
    } as NodeJS.ProcessEnv);
    expect(url).toBe('redis://10.0.0.1:6379/1');
  });

  it('should compose redis url from host, port, database and password', () => {
    expect.hasAssertions();
    const url = buildRedisConnectionUrl({
      AAA_REDIS_HOST: '127.0.0.1',
      AAA_REDIS_PORT: '6380',
      AAA_REDIS_DATABASE: '5',
      AAA_REDIS_PASSWORD: 'redis-test-password'
    } as NodeJS.ProcessEnv);
    expect(url).toBe('redis://:redis-test-password@127.0.0.1:6380/5');
  });
});
