/* istanbul ignore file */
import { resolveHTTPFramework } from '@src/interface/runtime/RuntimeEnvironment';

export async function startRestApiAdapter(env: NodeJS.ProcessEnv = process.env): Promise<void> {
  const framework = resolveHTTPFramework(env);
  if (framework === 'express') {
    await import('@src/interface/HTTP/adapters/express/express');
    return;
  }
  if (framework === 'fastify') {
    await import('@src/interface/HTTP/adapters/fastify/fastify');
    return;
  }
  if (framework === 'restify') {
    await import('@src/interface/HTTP/adapters/restify/restify');
    return;
  }
  if (framework === 'hyper-express') {
    await import('@src/interface/HTTP/adapters/hyper-express/hyper-express');
    return;
  }
  if (framework === 'cloudflare-workers') {
    await import('@src/interface/HTTP/adapters/cloudflare-workers/cloudflare-workers');
    return;
  }
  if (framework === 'vercel-functions') {
    await import('@src/interface/HTTP/adapters/vercel-functions/vercel-functions');
    return;
  }
  if (framework === 'loopback') {
    await import('@src/interface/HTTP/adapters/loopback/loopback');
    return;
  }
  if (framework === 'sails-js') {
    await import('@src/interface/HTTP/adapters/sails-js/sails-js');
    return;
  }
  if (framework === 'feathers') {
    await import('@src/interface/HTTP/adapters/feathers/feathers');
    return;
  }
  if (framework === 'derby-js') {
    await import('@src/interface/HTTP/adapters/derby-js/derby-js');
    return;
  }
  if (framework === 'adonis-js') {
    await import('@src/interface/HTTP/adapters/adonis-js/adonis-js');
    return;
  }
  if (framework === 'total-js') {
    await import('@src/interface/HTTP/adapters/total-js/total-js');
  }
}

// eslint-disable-next-line jest/require-hook
/* istanbul ignore if */
if (require.main === module) {
  startRestApiAdapter();
}
