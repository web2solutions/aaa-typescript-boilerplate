import { shouldStartRealtimeApi } from '@src/interface/runtime/RuntimeEnvironment';
import { startGrpcAdapter } from '@src/interface/gRPC/adapters/grpc/grpc';

export async function startGrpcApiAdapter(env: NodeJS.ProcessEnv = process.env): Promise<boolean> {
  if (!shouldStartRealtimeApi('grpc', env)) return false;
  await startGrpcAdapter();
  return true;
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startGrpcApiAdapter();
}
