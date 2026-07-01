export interface IRuntimeInfraDependencies<
  TDatabaseClient,
  TKeyValueStorageClient,
  TMutexService
> {
  databaseClient: TDatabaseClient;
  keyValueStorageClient: TKeyValueStorageClient;
  mutexService: TMutexService;
}

export interface IRuntimeInfraCompilers<
  TDatabaseClient,
  TKeyValueStorageClient,
  TMutexService
> {
  compileDatabaseClient: () => TDatabaseClient;
  compileKeyValueStorageClient: (driver?: string) => TKeyValueStorageClient;
  compileMutexService: (keyValueStorageClient: TKeyValueStorageClient) => TMutexService;
}

export function compileRuntimeInfra<
  TDatabaseClient,
  TKeyValueStorageClient,
  TMutexService
>(
  compilers: IRuntimeInfraCompilers<TDatabaseClient, TKeyValueStorageClient, TMutexService>,
  env: NodeJS.ProcessEnv = process.env
): IRuntimeInfraDependencies<TDatabaseClient, TKeyValueStorageClient, TMutexService> {
  const keyValueStorageClient = compilers.compileKeyValueStorageClient(
    env.AAA_KEYVALUESTORAGE_DRIVER
  );
  const mutexService = compilers.compileMutexService(keyValueStorageClient);
  const databaseClient = compilers.compileDatabaseClient();

  return {
    databaseClient,
    keyValueStorageClient,
    mutexService
  };
}
