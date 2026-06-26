import { MutexService } from '@src/infra/mutex/adapter/MutexService';

describe('mutex service branches', () => {
  it('covers lock/isLocked/unlock branches and singleton compile', async () => {
    expect.hasAssertions();
    const storage = {
      get: jest.fn()
        .mockResolvedValueOnce({ result: 'locked' })
        .mockResolvedValueOnce({ result: undefined }),
      set: jest.fn().mockResolvedValue({ result: true }),
      del: jest.fn().mockResolvedValue({ result: true })
    };

    const service = MutexService.compile(storage as any);

    const alreadyLocked = await service.lock('user', 'u1');
    expect(alreadyLocked.result).toStrictEqual({ previouslyLocked: true, locked: false });

    const nowLocked = await service.lock('user', 'u2');
    expect(nowLocked.result).toStrictEqual({ previouslyLocked: false, locked: true });

    const unlocked = await service.unlock('user', 'u2');
    expect(unlocked.result).toBe(true);

    storage.get.mockResolvedValueOnce({ error: new Error('boom') });
    const isLockedError = await service.isLocked('user', 'u3');
    expect(isLockedError.error).toBeDefined();

    const second = MutexService.compile(storage as any);
    expect(second).toBe(service);
  });

  it('returns existing singleton instance when compiled again', () => {
    expect.hasAssertions();
    const first = MutexService.compile({
      get: jest.fn().mockResolvedValue({ result: undefined }),
      set: jest.fn().mockResolvedValue({ result: true }),
      del: jest.fn().mockResolvedValue({ result: true })
    } as any);
    const second = MutexService.compile(undefined as any);
    expect(second).toBe(first);
  });
});
