import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetch as cloudflareFetch } from '@src/interface/HTTP/adapters/cloudflare-workers/cloudflare-workers';

const buildRequest = (req: VercelRequest): Request => {
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = (req.headers.host as string) || 'localhost';
  const url = `${protocol}://${host}${req.url}`;
  const method = req.method || 'GET';
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    } else if (typeof value === 'string') {
      headers.set(key, value);
    }
  });

  let body: string | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    body = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body || {});
  }

  return new Request(url, { method, headers, body });
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const response = await cloudflareFetch(buildRequest(req));
  const text = await response.text();

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.status(response.status).send(text);
}
