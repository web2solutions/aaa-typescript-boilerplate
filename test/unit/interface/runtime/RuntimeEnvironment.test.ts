import {
  resolveHTTPFramework,
  isRealtimeApiEnabled,
  resolveRealtimeApiProtocol,
  shouldStartRealtimeApi
} from '@src/interface/runtime/RuntimeEnvironment';

describe('runtime environment', () => {
  it('uses express as default framework', () => {
    expect.assertions(1);
    expect(resolveHTTPFramework({} as NodeJS.ProcessEnv)).toBe('express');
  });

  it('normalizes framework and protocol values from env strings', () => {
    expect.assertions(2);
    expect(resolveHTTPFramework({ AAA_HTTP_FRAMEWORK: ' EXPRESS ' } as NodeJS.ProcessEnv)).toBe('express');
    expect(resolveRealtimeApiProtocol({
      AAA_REALTIME_API_PROTOCOL: ' GRPC '
    } as NodeJS.ProcessEnv)).toBe('grpc');
  });

  it('throws for unsupported framework', () => {
    expect.assertions(1);
    expect(() => resolveHTTPFramework({ AAA_HTTP_FRAMEWORK: 'fastify' } as NodeJS.ProcessEnv))
      .toThrow('Unsupported AAA_HTTP_FRAMEWORK');
  });

  it('resolves realtime enablement from env', () => {
    expect.assertions(3);
    expect(isRealtimeApiEnabled({ AAA_REALTIME_API: 'yes' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isRealtimeApiEnabled({ AAA_REALTIME_API: 'no' } as NodeJS.ProcessEnv)).toBe(false);
    expect(isRealtimeApiEnabled({} as NodeJS.ProcessEnv)).toBe(false);
  });

  it('resolves realtime protocol with websocket default', () => {
    expect.assertions(2);
    expect(resolveRealtimeApiProtocol({} as NodeJS.ProcessEnv)).toBe('websocket');
    expect(resolveRealtimeApiProtocol({ AAA_REALTIME_API_PROTOCOL: 'grpc' } as NodeJS.ProcessEnv)).toBe('grpc');
  });

  it('throws for unsupported realtime protocol', () => {
    expect.assertions(1);
    expect(() => resolveRealtimeApiProtocol({ AAA_REALTIME_API_PROTOCOL: 'mqtt' } as NodeJS.ProcessEnv))
      .toThrow('Unsupported AAA_REALTIME_API_PROTOCOL');
  });

  it('checks protocol-specific startup gate', () => {
    expect.assertions(3);
    expect(shouldStartRealtimeApi('websocket', {
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket'
    } as NodeJS.ProcessEnv)).toBe(true);

    expect(shouldStartRealtimeApi('grpc', {
      AAA_REALTIME_API: 'yes',
      AAA_REALTIME_API_PROTOCOL: 'websocket'
    } as NodeJS.ProcessEnv)).toBe(false);

    expect(shouldStartRealtimeApi('grpc', {
      AAA_REALTIME_API: 'no',
      AAA_REALTIME_API_PROTOCOL: 'grpc'
    } as NodeJS.ProcessEnv)).toBe(false);
  });

  it('uses process env defaults when env argument is omitted', () => {
    expect.hasAssertions();
    const originalEnv = { ...process.env };
    process.env.AAA_HTTP_FRAMEWORK = 'express';
    process.env.AAA_REALTIME_API = 'yes';
    process.env.AAA_REALTIME_API_PROTOCOL = 'grpc';
    expect(resolveHTTPFramework()).toBe('express');
    expect(isRealtimeApiEnabled()).toBe(true);
    expect(resolveRealtimeApiProtocol()).toBe('grpc');
    expect(shouldStartRealtimeApi('grpc')).toBe(true);
    process.env = originalEnv;
  });
});
