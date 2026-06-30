import { InMemorySecurityAuditRepository } from '@src/infra/audit';

describe('in-memory security audit repository', () => {
  it('records, lists and clears audit events', async () => {
    expect.assertions(4);
    const repository = InMemorySecurityAuditRepository.compile() as InMemorySecurityAuditRepository;
    await repository.clear();
    await repository.record({
      id: 'evt-1',
      name: 'users.auth.login.success',
      outcome: 'success',
      occurredAt: new Date().toISOString(),
      payload: { username: 'john' }
    });

    const events = await repository.getAll();
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('evt-1');

    await repository.clear();
    const cleared = await repository.getAll();
    expect(cleared).toStrictEqual([]);
    expect(cleared).toHaveLength(0);
  });
});
