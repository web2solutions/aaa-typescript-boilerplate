describe('password crypto service', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('hashes and compares passwords', async () => {
    expect.hasAssertions();
    const { PasswordCryptoService } = await import('@src/infra/security/PasswordCryptoService');
    const service = PasswordCryptoService.compile();
    const { hash, salt } = await service.hash('12345678');
    expect(typeof hash).toBe('string');
    expect(typeof salt).toBe('string');
    await expect(service.compare('12345678', hash)).resolves.toBe(true);
  });

  it('returns singleton from compile', async () => {
    expect.hasAssertions();
    const { PasswordCryptoService } = await import('@src/infra/security/PasswordCryptoService');
    const first = PasswordCryptoService.compile();
    const second = PasswordCryptoService.compile();
    expect(second).toBe(first);
  });

  it('covers hash and compare reject branches', async () => {
    expect.hasAssertions();
    jest.doMock<typeof import('bcryptjs')>('bcryptjs', () => ({
      genSalt: (_rounds: number, callback: (err: Error | null, salt?: string) => void) => callback(null, 'mock-salt'),
      hash: (
        _password: string,
        _salt: string,
        callback: (err: Error | null, hash?: string) => void
      ) => callback(new Error('hash-failed')),
      compare: (
        _plainPassword: string,
        _hash: string,
        callback: (err: Error | null, result?: boolean) => void
      ) => callback(new Error('compare-failed'))
    }) as any);

    const { PasswordCryptoService } = await import('@src/infra/security/PasswordCryptoService');
    const service = new PasswordCryptoService();

    await expect(service.hash('12345678')).rejects.toThrow('hash-failed');
    await expect(service.compare('12345678', 'hash')).rejects.toThrow('compare-failed');
  });

  it('covers genSalt reject branch', async () => {
    expect.hasAssertions();
    jest.doMock<typeof import('bcryptjs')>('bcryptjs', () => ({
      genSalt: (_rounds: number, callback: (err: Error | null, salt?: string) => void) => callback(new Error('salt-failed')),
      hash: (_password: string, _salt: string, callback: (err: Error | null, hash?: string) => void) => callback(null, 'hash'),
      compare: (
        _plainPassword: string,
        _hash: string,
        callback: (err: Error | null, result?: boolean) => void
      ) => callback(null, true)
    }) as any);

    const { PasswordCryptoService } = await import('@src/infra/security/PasswordCryptoService');
    const service = new PasswordCryptoService();
    await expect(service.hash('12345678')).rejects.toThrow('salt-failed');
  });
});
