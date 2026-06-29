/* global describe, it, expect, jest */
import { infraHandlers } from '@src/interface/HTTP/adapters/total-js/handlers/infraHandlers';
import { Context } from '@src/infra/context/Context';

describe('total-js -> /localhost suite', () => {
  it('localhost should return 200 contract payload', async () => {
    expect.hasAssertions();

    const endpoint = infraHandlers.localhostGetHandlerFactory({} as any);
    const response = {
      statusCode: 200,
      json: jest.fn()
    };

    await new Promise<void>((resolve, reject) => {
      Context.run(new Map([['correlationId', 'totaljs-correlation-id']]), () => {
        try {
          endpoint.handler({} as any, response as any);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });

    expect(response.json).toHaveBeenCalledWith({
      status: 'result',
      correlationId: 'totaljs-correlation-id'
    });
  });
});
