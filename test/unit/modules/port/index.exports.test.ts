import * as PortModule from '@src/modules/port';

describe('port module exports', () => {
  it('exposes runtime exports through the barrel file', () => {
    expect.hasAssertions();
    const keys = Object.keys(PortModule);
    expect(keys.length).toBeGreaterThan(10);

    for (const key of keys) {
      expect((PortModule as any)[key]).toBeDefined();
    }
  });
});
