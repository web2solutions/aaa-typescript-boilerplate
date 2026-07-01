import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface ILoadedSpecs {
  asyncApiGrpc: Record<string, any>;
}

export const loadSpecs = (
  basePath = path.resolve(process.cwd(), 'spec')
): ILoadedSpecs => {
  const asyncApiGrpcPath = path.join(basePath, 'asyncapi', '1.0.0.grpc.yml');

  return {
    asyncApiGrpc: YAML.parse(fs.readFileSync(asyncApiGrpcPath, 'utf8'))
  };
};
