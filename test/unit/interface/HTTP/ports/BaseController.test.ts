import { BaseController } from '@src/interface/HTTP/ports/BaseController';

class ControllerUnderTest extends BaseController {}

describe('base controller', () => {
  it('wires dependencies from factory', () => {
    expect.hasAssertions();
    const controller = new ControllerUnderTest({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn(),
        throwIfUserHasNoAccessToResource: jest.fn()
      } as any,
      databaseClient: { stores: {} } as any,
      openApiSpecification: { openapi: '3.0.0' },
      passwordCryptoService: { hash: jest.fn(), compare: jest.fn() } as any,
      mutexService: { lock: jest.fn(), unlock: jest.fn() } as any
    });

    expect(controller.authService).toBeDefined();
    expect(controller.databaseClient).toBeDefined();
    expect(controller.passwordCryptoService).toBeDefined();
    expect(controller.mutexService).toBeDefined();
  });

  it('throws infra not implemented errors on invalid dependencies', () => {
    expect.hasAssertions();
    const controller = new ControllerUnderTest({
      authService: {
        authenticate: jest.fn(),
        authorize: jest.fn(),
        throwIfUserHasNoAccessToResource: jest.fn()
      } as any,
      databaseClient: { stores: {} } as any,
      openApiSpecification: {}
    });

    expect(() => { controller.authService = {} as any; }).toThrow('AuthService is not implemented');
    expect(() => { controller.databaseClient = {} as any; }).toThrow('DatabaseClient is not implemented');
    expect(() => { controller.passwordCryptoService = {} as any; }).toThrow('PasswordCryptoService is not implemented');
    expect(() => { controller.mutexService = {} as any; }).toThrow('MutexService is not implemented');
  });
});
