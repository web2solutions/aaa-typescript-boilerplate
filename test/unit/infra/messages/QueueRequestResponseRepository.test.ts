import { QueueRequestResponseRepository } from '@src/infra/messages/repositories';
import { IMessageMediator, IMessageResponse } from '@src/modules/port';

describe('queue request-response repository', () => {
  it('delegates requests to mediator with generated metadata', async () => {
    expect.hasAssertions();

    const mediator: IMessageMediator = {
      request: jest.fn().mockImplementation(async (message) => ({
        contract: message.contract,
        version: message.version,
        metadata: message.metadata,
        result: {
          ok: true
        }
      } as IMessageResponse<{ ok: boolean }>)),
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(),
      registerHandler: jest.fn()
    };

    const repository = new QueueRequestResponseRepository(mediator);
    const response = await repository.sendRequest<{ name: string }, { ok: boolean }>(
      'users.auth.ensure-access',
      { name: 'john' },
      { timeoutMs: 1000 }
    );

    expect(response.result?.ok).toBe(true);
    expect(mediator.request).toHaveBeenCalledTimes(1);
    expect(mediator.request).toHaveBeenCalledWith(
      expect.objectContaining({
        contract: 'users.auth.ensure-access',
        version: '1.0.0',
        payload: { name: 'john' },
        metadata: expect.objectContaining({
          traceId: expect.stringContaining('queue-rr-')
        })
      }),
      { timeoutMs: 1000 }
    );
  });
});
