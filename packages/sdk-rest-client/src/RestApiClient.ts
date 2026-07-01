import { loadSpecs } from './spec/loadSpecs';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export interface IRestApiRequest {
  operationId: string;
  pathParams?: Record<string, string | number>;
  query?: Record<string, string | number | boolean>;
  body?: unknown;
  headers?: Record<string, string>;
}

const compilePath = (
  pathTemplate: string,
  pathParams?: Record<string, string | number>
): string => {
  if (!pathParams) return pathTemplate;
  return Object.entries(pathParams).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), String(value));
  }, pathTemplate);
};

export class RestApiClient {
  private readonly baseUrl: string;

  private readonly operationToRoute: Map<string, { method: HttpMethod; path: string }> = new Map();

  constructor(baseUrl?: string) {
    const { openApi } = loadSpecs();
    const serverUrl = openApi?.servers?.[0]?.url || 'http://localhost:3000/api/1.0.0';
    this.baseUrl = baseUrl || serverUrl;

    for (const [routePath, methods] of Object.entries(openApi.paths || {})) {
      for (const [method, config] of Object.entries(methods as Record<string, any>)) {
        const operationId = config?.operationId;
        if (operationId) {
          this.operationToRoute.set(operationId, {
            method: method as HttpMethod,
            path: routePath
          });
        }
      }
    }
  }

  public async request<TResponse = unknown>(request: IRestApiRequest): Promise<TResponse> {
    const route = this.operationToRoute.get(request.operationId);
    if (!route) {
      throw new Error(`Operation "${request.operationId}" not found in OpenAPI spec.`);
    }

    const path = compilePath(route.path, request.pathParams);
    const url = new URL(`${this.baseUrl}${path}`);
    if (request.query) {
      for (const [key, value] of Object.entries(request.query)) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      method: route.method.toUpperCase(),
      headers: {
        'content-type': 'application/json',
        ...(request.headers || {})
      },
      body: request.body === undefined ? undefined : JSON.stringify(request.body)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`REST request failed: ${response.status} ${message}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json() as Promise<TResponse>;
    }
    return response.text() as TResponse;
  }
}

export default RestApiClient;
