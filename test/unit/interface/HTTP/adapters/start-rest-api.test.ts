/* eslint-disable jest/no-untyped-mock-factory */

describe('start-rest-api adapter loader', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('loads express adapter when framework is express', async () => {
    expect.assertions(1);
    const expressAdapterEvaluated = jest.fn();
    jest.doMock('@src/interface/HTTP/adapters/express/express', () => {
      expressAdapterEvaluated();
      return {};
    });
    const { startRestApiAdapter } = await import('@src/interface/HTTP/adapters/start-rest-api');
    await startRestApiAdapter({ AAA_HTTP_FRAMEWORK: 'express' } as NodeJS.ProcessEnv);
    expect(expressAdapterEvaluated).toHaveBeenCalledTimes(1);
  });

  it('throws for unsupported framework', async () => {
    expect.assertions(1);
    const { startRestApiAdapter } = await import('@src/interface/HTTP/adapters/start-rest-api');
    await expect(startRestApiAdapter({ AAA_HTTP_FRAMEWORK: 'fastify' } as NodeJS.ProcessEnv))
      .rejects
      .toThrow('Unsupported AAA_HTTP_FRAMEWORK');
  });

  it('uses process env when env argument is omitted', async () => {
    expect.assertions(1);
    process.env.AAA_HTTP_FRAMEWORK = 'express';
    const expressAdapterEvaluated = jest.fn();
    jest.doMock('@src/interface/HTTP/adapters/express/express', () => {
      expressAdapterEvaluated();
      return {};
    });
    const { startRestApiAdapter } = await import('@src/interface/HTTP/adapters/start-rest-api');
    await startRestApiAdapter();
    expect(expressAdapterEvaluated).toHaveBeenCalledTimes(1);
  });
});
