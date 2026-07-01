import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface ILoadedSpecs {
  asyncApiWebSocket: Record<string, any>;
}

export const loadSpecs = (
  basePath = path.resolve(process.cwd(), 'spec')
): ILoadedSpecs => {
  const asyncApiWebSocketPath = path.join(basePath, 'asyncapi', '1.0.0.websocket.yml');

  return {
    asyncApiWebSocket: YAML.parse(fs.readFileSync(asyncApiWebSocketPath, 'utf8'))
  };
};
