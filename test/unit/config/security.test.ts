import { isCorsOriginAllowed } from '@src/config/security';

describe('security config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AAA_CORS_ALLOWED_ORIGINS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('allows all origins outside production when allowlist is empty', () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'dev';
    expect(isCorsOriginAllowed('https://random.example')).toBe(true);
  });

  it('denies origins in production when allowlist is empty', () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'production';
    expect(isCorsOriginAllowed('https://random.example')).toBe(false);
  });

  it('allows configured origin in production', () => {
    expect.assertions(1);
    process.env.NODE_ENV = 'production';
    process.env.AAA_CORS_ALLOWED_ORIGINS = 'https://allowed.example';
    expect(isCorsOriginAllowed('https://allowed.example')).toBe(true);
  });

  it('allows any origin when wildcard is configured and allows undefined origin', () => {
    expect.hasAssertions();
    process.env.NODE_ENV = 'production';
    process.env.AAA_CORS_ALLOWED_ORIGINS = ' * ';
    expect(isCorsOriginAllowed('https://any.example')).toBe(true);
    expect(isCorsOriginAllowed(undefined)).toBe(true);
  });

  it('treats NODE_ENV=prod as production alias', () => {
    expect.hasAssertions();
    process.env.NODE_ENV = 'prod';
    delete process.env.AAA_CORS_ALLOWED_ORIGINS;
    expect(isCorsOriginAllowed('https://random.example')).toBe(false);
  });
});
