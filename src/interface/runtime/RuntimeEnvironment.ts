/* istanbul ignore file */
export type HTTPFramework = 'express';

export type RealtimeApiProtocol = 'websocket' | 'grpc';

const DEFAULT_HTTP_FRAMEWORK: HTTPFramework = 'express';
const DEFAULT_REALTIME_PROTOCOL: RealtimeApiProtocol = 'websocket';

function normalize(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}

export function resolveHTTPFramework(env: NodeJS.ProcessEnv = process.env): HTTPFramework {
  const framework = normalize(env.AAA_HTTP_FRAMEWORK) || DEFAULT_HTTP_FRAMEWORK;
  if (framework === 'express') return framework;
  throw new Error(
    `Unsupported AAA_HTTP_FRAMEWORK "${env.AAA_HTTP_FRAMEWORK}". Supported: express.`
  );
}

export function isRealtimeApiEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return normalize(env.AAA_REALTIME_API || 'no') === 'yes';
}

export function resolveRealtimeApiProtocol(
  env: NodeJS.ProcessEnv = process.env
): RealtimeApiProtocol {
  const protocol = normalize(env.AAA_REALTIME_API_PROTOCOL) || DEFAULT_REALTIME_PROTOCOL;
  if (protocol === 'websocket' || protocol === 'grpc') return protocol;
  throw new Error(
    `Unsupported AAA_REALTIME_API_PROTOCOL "${env.AAA_REALTIME_API_PROTOCOL}". Supported: websocket, grpc.`
  );
}

export function shouldStartRealtimeApi(
  expectedProtocol: RealtimeApiProtocol,
  env: NodeJS.ProcessEnv = process.env
): boolean {
  if (!isRealtimeApiEnabled(env)) return false;
  return resolveRealtimeApiProtocol(env) === expectedProtocol;
}
