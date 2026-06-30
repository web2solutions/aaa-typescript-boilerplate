import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { loadSpecs } from '../spec/loadSpecs';

export interface IGrpcApiRequest {
  operationId: string;
  version?: string;
  authorization?: string;
  input?: Record<string, any>;
  params?: Record<string, any>;
  queryString?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IGrpcApiResponse {
  ok: boolean;
  version?: string;
  operationId: string;
  result?: any;
  error?: {
    name?: string;
    message?: string;
  };
}

export class GrpcApiClient {
  private readonly host: string;

  private readonly protoFilePath: string;

  private readonly client: any;

  constructor(host?: string, protoFilePath?: string) {
    const { asyncApiGrpc } = loadSpecs();
    this.host = host || asyncApiGrpc?.servers?.local?.host || 'localhost:3002';
    this.protoFilePath = protoFilePath || path.resolve(process.cwd(), 'src/interface/gRPC/proto/async-api.proto');

    const packageDefinition = protoLoader.loadSync(this.protoFilePath, {
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
    this.client = new grpcObject.realtime.AsyncApiGateway(
      this.host,
      grpc.credentials.createInsecure()
    );
  }

  public request(payload: IGrpcApiRequest): Promise<IGrpcApiResponse> {
    const grpcPayload = {
      version: payload.version || '',
      operationId: payload.operationId,
      authorization: payload.authorization || '',
      inputJson: JSON.stringify(payload.input || {}),
      paramsJson: JSON.stringify(payload.params || {}),
      queryStringJson: JSON.stringify(payload.queryString || {}),
      metadataJson: JSON.stringify(payload.metadata || {})
    };

    return new Promise((resolve, reject) => {
      this.client.request(grpcPayload, (error: Error | null, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        if (!response?.ok) {
          reject(new Error(response?.errorMessage || 'gRPC operation failed'));
          return;
        }
        resolve({
          ok: response.ok,
          version: response.version,
          operationId: response.operationId,
          result: response.resultJson ? JSON.parse(response.resultJson) : undefined,
          error: response.errorName || response.errorMessage
            ? {
              name: response.errorName,
              message: response.errorMessage
            }
            : undefined
        });
      });
    });
  }
}

export default GrpcApiClient;
