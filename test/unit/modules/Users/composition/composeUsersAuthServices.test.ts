/* eslint-disable jest/max-expects, jest/prefer-called-with */
import { composeUsersAuthServices } from '@src/modules/Users/composition/composeUsersAuthServices';
import { registerUserEventListeners } from '@src/modules/Users/events/listeners/registerUserEventListeners';
import { UserDataRepository } from '@src/modules/Users/adapters/out/persistence/UserDataRepository';
import { UserService } from '@src/modules/Users/service/UserService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { UserUseCases } from '@src/modules/Users/application/use-cases/UserUseCases';
import { AuthUseCases } from '@src/modules/Users/application/use-cases/AuthUseCases';

jest.mock<typeof import('@src/modules/Users/events/listeners/registerUserEventListeners')>('@src/modules/Users/events/listeners/registerUserEventListeners', () => ({
  registerUserEventListeners: jest.fn()
}));

describe('compose users auth services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('wires all dependencies and registers listeners when event bus exists', () => {
    expect.hasAssertions();
    const dataRepository = {} as any;
    const userService = {} as any;
    const userProvider = {} as any;
    const authService = {} as any;
    const userUseCases = {} as any;
    const authUseCases = {} as any;

    const repoSpy = jest.spyOn(UserDataRepository, 'compile').mockReturnValue(dataRepository);
    const serviceSpy = jest.spyOn(UserService, 'compile').mockReturnValue(userService);
    const providerSpy = jest.spyOn(UserProviderLocal, 'compile').mockReturnValue(userProvider);
    const authServiceSpy = jest.spyOn(AuthService, 'compile').mockReturnValue(authService);
    const userUseCasesSpy = jest.spyOn(UserUseCases, 'compile').mockReturnValue(userUseCases);
    const authUseCasesSpy = jest.spyOn(AuthUseCases, 'compile').mockReturnValue(authUseCases);

    const eventBus = { publish: jest.fn() };
    const result = composeUsersAuthServices({
      databaseClient: { stores: {} } as any,
      passwordCryptoService: { hash: jest.fn(), compare: jest.fn() } as any,
      mutexService: { lock: jest.fn(), unlock: jest.fn() } as any,
      jwtService: { sign: jest.fn(), verify: jest.fn() } as any,
      eventBus: eventBus as any
    });

    expect(repoSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalled();
    expect(providerSpy).toHaveBeenCalled();
    expect(authServiceSpy).toHaveBeenCalled();
    expect(userUseCasesSpy).toHaveBeenCalled();
    expect(authUseCasesSpy).toHaveBeenCalled();
    expect(registerUserEventListeners).toHaveBeenCalledWith(eventBus, undefined);
    expect(result).toStrictEqual({
      dataRepository,
      userService,
      userProvider,
      authService,
      userUseCases,
      authUseCases
    });
  });

  it('does not register listeners when event bus is missing', () => {
    expect.hasAssertions();
    jest.spyOn(UserDataRepository, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserService, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserProviderLocal, 'compile').mockReturnValue({} as any);
    jest.spyOn(AuthService, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserUseCases, 'compile').mockReturnValue({} as any);
    jest.spyOn(AuthUseCases, 'compile').mockReturnValue({} as any);

    composeUsersAuthServices({
      databaseClient: { stores: {} } as any,
      passwordCryptoService: { hash: jest.fn(), compare: jest.fn() } as any,
      mutexService: { lock: jest.fn(), unlock: jest.fn() } as any,
      jwtService: { sign: jest.fn(), verify: jest.fn() } as any
    });

    expect(registerUserEventListeners).not.toHaveBeenCalled();
  });
});
