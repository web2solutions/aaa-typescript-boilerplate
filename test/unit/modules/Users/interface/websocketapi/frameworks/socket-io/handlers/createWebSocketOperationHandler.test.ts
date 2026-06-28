import createWebSocketOperationHandler from '@src/modules/Users/interface/websocketapi/frameworks/socket-io/handlers/_createWebSocketOperationHandler';

describe('createWebSocketOperationHandler', () => {
  it('injects request metadata and keeps response metadata shape when missing', async () => {
    expect.hasAssertions();
    const invoke = jest.fn().mockResolvedValue({
      ok: true,
      result: { token: 'x' }
    });
    const handler = createWebSocketOperationHandler('login')({ invoke } as any);

    const response = await handler({
      input: { username: 'john' },
      metadata: {}
    } as any);

    expect(invoke).toHaveBeenCalledWith(expect.objectContaining({
      operationId: 'login',
      metadata: expect.objectContaining({
        channel: 'api:login:response',
        requestId: '',
        clientId: ''
      })
    }));
    expect(response.metadata).toStrictEqual({
      channel: 'api:login:response',
      requestId: '',
      clientId: ''
    });
  });
});
