/* eslint-disable @typescript-eslint/no-explicit-any */

import path from 'path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

import { _HTTP_PORT_ } from '@src/config/constants';
import {
  IAsyncOperationRequest,
  IAsyncOperationResponse,
  IRealtimeAPIFactory,
  RealtimeAPIBase
} from '@src/interface/Async/RealtimeAPIBase';

export interface IGrpcAPIFactory extends IRealtimeAPIFactory {
  host?: string;
  port?: number;
  protoFilePath?: string;
}

interface IGrpcAsyncApiRequest {
  version?: string;
  operationId: string;
  requestId?: string;
  clientId?: string;
  authorization?: string;
  inputJson?: string;
  paramsJson?: string;
  queryStringJson?: string;
  metadataJson?: string;
}

interface IGrpcAsyncApiResponse {
  ok: boolean;
  version?: string;
  operationId: string;
  requestId?: string;
  clientId?: string;
  metadataJson?: string;
  resultJson?: string;
  errorName?: string;
  errorMessage?: string;
}

export class GrpcAPI extends RealtimeAPIBase {
  private readonly host: string;

  private readonly port: number;

  private readonly protoFilePath: string;

  private server?: grpc.Server;

  constructor(config: IGrpcAPIFactory) {
    super({
      ...config,
      interfaceType: 'grpcapi',
      frameworkName: 'grpc'
    });
    this.host = config.host || '0.0.0.0';
    this.port = config.port || Number(process.env.AAA_GRPC_PORT || (_HTTP_PORT_ + 2));
    this.protoFilePath = config.protoFilePath
      || path.resolve('./src/interface/gRPC/proto/async-api.proto');
  }

  private static parseJson(raw?: string): Record<string, any> {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (error) {
      return {};
    }
  }

  private static toGrpcResponse(response: IAsyncOperationResponse): IGrpcAsyncApiResponse {
    const requestId = response.metadata?.requestId;
    const clientId = response.metadata?.clientId;
    return {
      ok: response.ok,
      version: response.version,
      operationId: response.operationId,
      requestId,
      clientId,
      metadataJson: response.metadata ? JSON.stringify(response.metadata) : undefined,
      resultJson: response.result === undefined ? undefined : JSON.stringify(response.result),
      errorName: response.error?.name,
      errorMessage: response.error?.message
    };
  }

  private static toDomainRequest(request: IGrpcAsyncApiRequest): IAsyncOperationRequest {
    const metadataFromJson = GrpcAPI.parseJson(request.metadataJson);
    return {
      version: request.version,
      operationId: request.operationId,
      authorization: request.authorization || '',
      input: GrpcAPI.parseJson(request.inputJson),
      params: GrpcAPI.parseJson(request.paramsJson),
      queryString: GrpcAPI.parseJson(request.queryStringJson),
      metadata: {
        ...metadataFromJson,
        requestId: request.requestId || metadataFromJson.requestId,
        clientId: request.clientId || metadataFromJson.clientId
      }
    };
  }

  private loadProtoService(): any {
    const packageDefinition = protoLoader.loadSync(this.protoFilePath, {
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    const grpcObject = grpc.loadPackageDefinition(packageDefinition) as any;
    return grpcObject.realtime;
  }

  public async start(): Promise<void> {
    if (this.started) return;
    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.connect();
    }
    await this.databaseClient.connect();

    const realtimePackage = this.loadProtoService();
    this.server = new grpc.Server();
    this.server.addService(realtimePackage.AsyncApiGateway.service, {
      request: async (
        call: grpc.ServerUnaryCall<IGrpcAsyncApiRequest, IGrpcAsyncApiResponse>,
        callback: grpc.sendUnaryData<IGrpcAsyncApiResponse>
      ) => {
        const response = await this.executeOperation(
          GrpcAPI.toDomainRequest(call.request)
        );
        callback(null, GrpcAPI.toGrpcResponse(response));
      },
      exchange: (
        stream: grpc.ServerDuplexStream<IGrpcAsyncApiRequest, IGrpcAsyncApiResponse>
      ) => {
        stream.on('data', async (request: IGrpcAsyncApiRequest) => {
          const response = await this.executeOperation(
            GrpcAPI.toDomainRequest(request)
          );
          stream.write(GrpcAPI.toGrpcResponse(response));
        });
        stream.on('end', () => {
          stream.end();
        });
      }
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.bindAsync(
        `${this.host}:${this.port}`,
        grpc.ServerCredentials.createInsecure(),
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          this.server!.start();
          resolve();
        }
      );
    });

    this.started = true;
  }

  public async stop(): Promise<void> {
    if (!this.started) return;

    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.tryShutdown(() => resolve());
      });
      this.server = undefined;
    }

    if (this.keyValueStorageClient) {
      await this.keyValueStorageClient.disconnect();
    }
    await this.databaseClient.disconnect();
    this.started = false;
  }
}

export default GrpcAPI;
