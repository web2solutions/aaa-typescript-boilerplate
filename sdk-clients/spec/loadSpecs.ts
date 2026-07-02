import { loadSpecs as loadRestSpecs } from '@jumentix/sdk-rest-client';
import { loadSpecs as loadWebSocketSpecs } from '@jumentix/sdk-websocket-client';
import { loadSpecs as loadGrpcSpecs } from '@jumentix/sdk-grpc-client';

export interface ILoadedSpecs {
  openApi: Record<string, any>;
  asyncApiWebSocket: Record<string, any>;
  asyncApiGrpc: Record<string, any>;
}

export const loadSpecs = (): ILoadedSpecs => {
  const { openApi } = loadRestSpecs();
  const { asyncApiWebSocket } = loadWebSocketSpecs();
  const { asyncApiGrpc } = loadGrpcSpecs();
  return { openApi, asyncApiWebSocket, asyncApiGrpc };
};
