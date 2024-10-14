/* global  describe, it, expect */
import { handler } from '@src/interface/HTTP/adapters/aws/lambda/handlers/localhost';
import { composeContext, composeHttpEvent } from '@test/integration/Lambda/utils';

describe('aws lambda -> / handler', () => {
  it('get /', async () => {
    expect.hasAssertions();

    const { statusCode, body } = await handler(composeHttpEvent({
      path: '/',
      method: 'GET'
    }), composeContext(), () => {});

    const { status } = JSON.parse(body);

    expect(statusCode).toBe(200);
    expect(status).toBe('result');
  });
});
