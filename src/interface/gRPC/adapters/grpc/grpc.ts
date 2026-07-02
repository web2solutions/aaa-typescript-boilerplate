import { compileDatabaseClient } from '@src/infra/persistence/compileDatabaseClient';
import { JwtService } from '@src/infra/jwt/JwtService';
import { compileKeyValueStorageClient } from '@src/infra/persistence/KeyValueStorage/compileKeyValueStorageClient';
import { PasswordCryptoService } from '@src/infra/security/PasswordCryptoService';
import { MutexService } from '@src/infra/mutex/adapter/MutexService';
import { compileMessageMediator } from '@src/infra/messages/compileMessageMediator';
import { composeUsersAuthServices } from '@src/modules/Users';
import { GrpcAPI } from '@src/interface/gRPC/gRPCAPI';
import { ExpressServer } from '@src/interface/HTTP/adapters/express/ExpressServer';
import { infraHandlers } from '@src/interface/HTTP/adapters/express/handlers/infraHandlers';
import { EHTTPFrameworks } from '@src/interface/HTTP/ports';
import { RestAPI } from '@src/interface/HTTP/RestAPI';
import { compileAdapterRuntime } from '@jumentix/adapter-runtime-bootstrap';

export function shouldStartFallbackRestApi(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.AAA_DISABLE_FALLBACK_REST !== 'true';
}

export async function startGrpcAdapter(): Promise<void> {
  const {
    databaseClient,
    keyValueStorageClient,
    mutexService,
    passwordCryptoService,
    messageMediator,
    authService
  } = compileAdapterRuntime({
    compileDatabaseClient,
    compileKeyValueStorageClient,
    compileMutexService: (client) => MutexService.compile(client),
    compilePasswordCryptoService: () => PasswordCryptoService.compile(),
    compileJwtService: () => JwtService.compile(),
    compileMessageMediator: () => compileMessageMediator(),
    composeAuthServices: composeUsersAuthServices
  });

  const API = new GrpcAPI({
    databaseClient,
    authService,
    passwordCryptoService,
    keyValueStorageClient,
    mutexService,
    eventBus: messageMediator,
    messageMediator
  });

  let fallbackRestAPI: RestAPI<any> | undefined;
  if (shouldStartFallbackRestApi()) {
    process.env.AAA_HTTP_PORT = process.env.AAA_HTTP_FALLBACK_PORT || '3000';
    fallbackRestAPI = new RestAPI({
      databaseClient,
      webServer: ExpressServer.compile(),
      infraHandlers,
      serverType: EHTTPFrameworks.express,
      authService,
      passwordCryptoService,
      keyValueStorageClient,
      mutexService,
      eventBus: messageMediator,
      messageMediator
    });
  }

  if (fallbackRestAPI) {
    await fallbackRestAPI.start();
  }
  await API.start();
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startGrpcAdapter();
}
