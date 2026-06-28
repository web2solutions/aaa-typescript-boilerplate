import { shouldStartRealtimeApi } from '@src/interface/runtime/RuntimeEnvironment';
import { startWebSocketAdapter } from '@src/interface/WebSocket/adapters/socket-io/socket-io';

export async function startWebSocketApiAdapter(
  env: NodeJS.ProcessEnv = process.env
): Promise<boolean> {
  if (!shouldStartRealtimeApi('websocket', env)) return false;
  await startWebSocketAdapter();
  return true;
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startWebSocketApiAdapter();
}
