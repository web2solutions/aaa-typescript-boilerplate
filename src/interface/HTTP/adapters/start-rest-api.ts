import { resolveHTTPFramework } from '@src/interface/runtime/RuntimeEnvironment';

export async function startRestApiAdapter(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const framework = resolveHTTPFramework(env);
  /* istanbul ignore else */
  if (framework === 'express') {
    await import('@src/interface/HTTP/adapters/express/express');
  }
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startRestApiAdapter();
}
