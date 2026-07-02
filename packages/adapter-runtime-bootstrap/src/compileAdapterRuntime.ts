import { compileRuntimeInfra } from '@jumentix/runtime-infra';

export interface ICompileAdapterRuntimeOptions<
  TDatabaseClient,
  TKeyValueStorageClient,
  TMutexService,
  TPasswordCryptoService,
  TJwtService,
  TMessageMediator,
  TAuthService
> {
  compileDatabaseClient: () => TDatabaseClient;
  compileKeyValueStorageClient: (driver?: string) => TKeyValueStorageClient;
  compileMutexService: (keyValueStorageClient: TKeyValueStorageClient) => TMutexService;
  compilePasswordCryptoService: () => TPasswordCryptoService;
  compileJwtService: () => TJwtService;
  compileMessageMediator: () => TMessageMediator;
  composeAuthServices: (deps: {
    databaseClient: TDatabaseClient;
    passwordCryptoService: TPasswordCryptoService;
    mutexService: TMutexService;
    jwtService: TJwtService;
    keyValueStorageClient: TKeyValueStorageClient;
    messageMediator: TMessageMediator;
  }) => {
    authService: TAuthService;
  };
  env?: NodeJS.ProcessEnv;
}

export function compileAdapterRuntime<
  TDatabaseClient,
  TKeyValueStorageClient,
  TMutexService,
  TPasswordCryptoService,
  TJwtService,
  TMessageMediator,
  TAuthService
>(
  options: ICompileAdapterRuntimeOptions<
    TDatabaseClient,
    TKeyValueStorageClient,
    TMutexService,
    TPasswordCryptoService,
    TJwtService,
    TMessageMediator,
    TAuthService
  >
) {
  const passwordCryptoService = options.compilePasswordCryptoService();
  const jwtService = options.compileJwtService();
  const messageMediator = options.compileMessageMediator();
  const { databaseClient, keyValueStorageClient, mutexService } = compileRuntimeInfra(
    {
      compileDatabaseClient: options.compileDatabaseClient,
      compileKeyValueStorageClient: options.compileKeyValueStorageClient,
      compileMutexService: options.compileMutexService
    },
    options.env
  );

  const { authService } = options.composeAuthServices({
    databaseClient,
    passwordCryptoService,
    mutexService,
    jwtService,
    keyValueStorageClient,
    messageMediator
  });

  return {
    databaseClient,
    keyValueStorageClient,
    mutexService,
    passwordCryptoService,
    jwtService,
    messageMediator,
    authService
  };
}
