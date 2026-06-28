import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface ILoadedSpecs {
  openApi: Record<string, any>;
  asyncApiWebSocket: Record<string, any>;
  asyncApiGrpc: Record<string, any>;
}

export const loadSpecs = (
  basePath = path.resolve(process.cwd(), 'spec')
): ILoadedSpecs => {
  const openApiPath = path.join(basePath, '1.0.0.yml');
  const asyncApiWebSocketPath = path.join(basePath, 'asyncapi', '1.0.0.websocket.yml');
  const asyncApiGrpcPath = path.join(basePath, 'asyncapi', '1.0.0.grpc.yml');

  return {
    openApi: YAML.parse(fs.readFileSync(openApiPath, 'utf8')),
    asyncApiWebSocket: YAML.parse(fs.readFileSync(asyncApiWebSocketPath, 'utf8')),
    asyncApiGrpc: YAML.parse(fs.readFileSync(asyncApiGrpcPath, 'utf8'))
  };
};
