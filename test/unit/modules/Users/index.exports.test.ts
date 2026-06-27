import * as UsersModule from '@src/modules/Users';

describe('users module exports', () => {
  it('exposes all runtime exports through the barrel file', () => {
    expect.hasAssertions();
    const keys = Object.keys(UsersModule);
    expect(keys.length).toBeGreaterThan(40);

    for (const key of keys) {
      expect((UsersModule as any)[key]).toBeDefined();
    }
  });
});
