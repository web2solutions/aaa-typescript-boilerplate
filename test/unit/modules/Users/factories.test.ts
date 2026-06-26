import {
  AuthUseCases,
  AuthController,
  AuthService,
  UserController,
  UserDataRepository,
  UserProviderLocal,
  UserService,
  UserUseCases
} from '@src/modules/Users';

const store = {};

const databaseClient = {
  stores: {
    User: store
  }
};

const passwordCryptoService = {
  hash: jest.fn(),
  compare: jest.fn()
};

const mutexService = {
  lock: jest.fn(),
  unlock: jest.fn()
};

const jwtService = {
  decodeToken: jest.fn(),
  generateToken: jest.fn()
};

const authService = {
  authenticate: jest.fn()
};

describe('user factories', () => {
  it('return fresh instances from compile calls', () => {
    expect.hasAssertions();

    const dataRepository = UserDataRepository.compile({
      databaseClient: databaseClient as never
    });
    const otherDataRepository = UserDataRepository.compile({
      databaseClient: databaseClient as never
    });

    const userService = UserService.compile({
      dataRepository,
      services: {
        passwordCryptoService,
        mutexService
      }
    });
    const otherUserService = UserService.compile({
      dataRepository,
      services: {
        passwordCryptoService,
        mutexService
      }
    });

    const userProvider = UserProviderLocal.compile(userService);
    const otherUserProvider = UserProviderLocal.compile(userService);
    const userUseCases = UserUseCases.compile(userService);
    const otherUserUseCases = UserUseCases.compile(userService);

    const compiledAuthService = AuthService.compile(
      userProvider,
      passwordCryptoService as never,
      jwtService as never
    );
    const otherAuthService = AuthService.compile(
      userProvider,
      passwordCryptoService as never,
      jwtService as never
    );
    const authUseCases = AuthUseCases.compile(compiledAuthService, mutexService as never);
    const otherAuthUseCases = AuthUseCases.compile(compiledAuthService, mutexService as never);

    const controllerFactory = {
      authService,
      databaseClient,
      openApiSpecification: {},
      userService,
      userUseCases,
      authUseCases,
      passwordCryptoService,
      mutexService
    };

    const userController = UserController.compile(controllerFactory as never);
    const otherUserController = UserController.compile(controllerFactory as never);
    const authController = AuthController.compile(controllerFactory as never);
    const otherAuthController = AuthController.compile(controllerFactory as never);

    expect([
      dataRepository === otherDataRepository,
      userService === otherUserService,
      userProvider === otherUserProvider,
      userUseCases === otherUserUseCases,
      compiledAuthService === otherAuthService,
      authUseCases === otherAuthUseCases,
      userController === otherUserController,
      authController === otherAuthController
    ]).toStrictEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false
    ]);
  });
});
