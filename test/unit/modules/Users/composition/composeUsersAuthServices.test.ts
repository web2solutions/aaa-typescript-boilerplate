/* eslint-disable jest/max-expects, jest/prefer-called-with */
import { composeUsersAuthServices } from '@src/modules/Users/composition/composeUsersAuthServices';
import { registerUserEventListeners } from '@src/modules/Users/events/listeners/registerUserEventListeners';
import { registerUserMessageHandlers } from '@src/modules/Users/events/listeners/registerUserMessageHandlers';
import { UserDataRepository } from '@src/modules/Users/adapters/out/persistence/UserDataRepository';
import { OrganizationDataRepository } from '@src/modules/Users/adapters/out/persistence/OrganizationDataRepository';
import { UserService } from '@src/modules/Users/service/UserService';
import { OrganizationService } from '@src/modules/Users/service/OrganizationService';
import { UserProviderLocal } from '@src/modules/Users/service/UserProviderLocal';
import { AuthService } from '@src/modules/Users/service/AuthService';
import { UserUseCases } from '@src/modules/Users/application/use-cases/UserUseCases';
import { OrganizationUseCases } from '@src/modules/Users/application/use-cases/OrganizationUseCases';
import { AuthUseCases } from '@src/modules/Users/application/use-cases/AuthUseCases';

jest.mock<typeof import('@src/modules/Users/events/listeners/registerUserEventListeners')>('@src/modules/Users/events/listeners/registerUserEventListeners', () => ({
  registerUserEventListeners: jest.fn()
}));
jest.mock<typeof import('@src/modules/Users/events/listeners/registerUserMessageHandlers')>('@src/modules/Users/events/listeners/registerUserMessageHandlers', () => ({
  registerUserMessageHandlers: jest.fn()
}));

describe('compose users auth services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('wires all dependencies and registers listeners when event bus exists', () => {
    expect.hasAssertions();
    const dataRepository = {} as any;
    const organizationDataRepository = {} as any;
    const userService = {} as any;
    const organizationService = {} as any;
    const userProvider = {} as any;
    const authService = {} as any;
    const userUseCases = {} as any;
    const organizationUseCases = {} as any;
    const authUseCases = {} as any;

    const repoSpy = jest.spyOn(UserDataRepository, 'compile').mockReturnValue(dataRepository);
    const organizationRepoSpy = jest.spyOn(OrganizationDataRepository, 'compile').mockReturnValue(organizationDataRepository);
    const serviceSpy = jest.spyOn(UserService, 'compile').mockReturnValue(userService);
    const organizationServiceSpy = jest.spyOn(OrganizationService, 'compile').mockReturnValue(organizationService);
    const providerSpy = jest.spyOn(UserProviderLocal, 'compile').mockReturnValue(userProvider);
    const authServiceSpy = jest.spyOn(AuthService, 'compile').mockReturnValue(authService);
    const userUseCasesSpy = jest.spyOn(UserUseCases, 'compile').mockReturnValue(userUseCases);
    const organizationUseCasesSpy = jest.spyOn(OrganizationUseCases, 'compile').mockReturnValue(organizationUseCases);
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
    expect(organizationRepoSpy).toHaveBeenCalled();
    expect(serviceSpy).toHaveBeenCalled();
    expect(organizationServiceSpy).toHaveBeenCalled();
    expect(providerSpy).toHaveBeenCalled();
    expect(authServiceSpy).toHaveBeenCalled();
    expect(userUseCasesSpy).toHaveBeenCalled();
    expect(organizationUseCasesSpy).toHaveBeenCalled();
    expect(authUseCasesSpy).toHaveBeenCalled();
    expect(registerUserEventListeners).toHaveBeenCalledWith(eventBus, undefined);
    expect(registerUserMessageHandlers).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      dataRepository,
      organizationDataRepository,
      userService,
      organizationService,
      userProvider,
      authService,
      userUseCases,
      organizationUseCases,
      authUseCases
    });
  });

  it('does not register listeners when event bus is missing', () => {
    expect.hasAssertions();
    jest.spyOn(UserDataRepository, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationDataRepository, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserService, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationService, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserProviderLocal, 'compile').mockReturnValue({} as any);
    jest.spyOn(AuthService, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserUseCases, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationUseCases, 'compile').mockReturnValue({} as any);
    jest.spyOn(AuthUseCases, 'compile').mockReturnValue({} as any);

    composeUsersAuthServices({
      databaseClient: { stores: {} } as any,
      passwordCryptoService: { hash: jest.fn(), compare: jest.fn() } as any,
      mutexService: { lock: jest.fn(), unlock: jest.fn() } as any,
      jwtService: { sign: jest.fn(), verify: jest.fn() } as any
    });

    expect(registerUserEventListeners).not.toHaveBeenCalled();
    expect(registerUserMessageHandlers).not.toHaveBeenCalled();
  });

  it('registers request/response handlers when message mediator exists', () => {
    expect.hasAssertions();
    jest.spyOn(UserDataRepository, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationDataRepository, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserService, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationService, 'compile').mockReturnValue({} as any);
    jest.spyOn(UserProviderLocal, 'compile').mockReturnValue({} as any);
    const authService = {} as any;
    jest.spyOn(AuthService, 'compile').mockReturnValue(authService);
    jest.spyOn(UserUseCases, 'compile').mockReturnValue({} as any);
    jest.spyOn(OrganizationUseCases, 'compile').mockReturnValue({} as any);
    jest.spyOn(AuthUseCases, 'compile').mockReturnValue({} as any);

    const messageMediator = {
      request: jest.fn(),
      registerHandler: jest.fn(),
      publish: jest.fn(),
      subscribe: jest.fn()
    };

    composeUsersAuthServices({
      databaseClient: { stores: {} } as any,
      passwordCryptoService: { hash: jest.fn(), compare: jest.fn() } as any,
      mutexService: { lock: jest.fn(), unlock: jest.fn() } as any,
      jwtService: { sign: jest.fn(), verify: jest.fn() } as any,
      messageMediator: messageMediator as any
    });

    expect(registerUserEventListeners).toHaveBeenCalledWith(messageMediator, undefined);
    expect(registerUserMessageHandlers).toHaveBeenCalledWith(messageMediator, authService);
  });
});
