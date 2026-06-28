import { io, Socket } from 'socket.io-client';
import { loadSpecs } from '../spec/loadSpecs';

export interface IWebSocketApiRequest {
  operationId: string;
  version?: string;
  authorization?: string;
  input?: Record<string, any>;
  params?: Record<string, any>;
  queryString?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface IWebSocketApiResponse {
  ok: boolean;
  version?: string;
  operationId: string;
  result?: any;
  error?: {
    name: string;
    message: string;
  };
}

export class WebSocketApiClient {
  private readonly url: string;

  private readonly path: string;

  private socket?: Socket;

  constructor(url?: string) {
    const { asyncApiWebSocket } = loadSpecs();
    const host = asyncApiWebSocket?.servers?.local?.host || 'localhost:3001';
    this.url = url || `ws://${host}`;
    this.path = '/ws';
  }

  public connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(this.url, {
      path: this.path,
      transports: ['websocket']
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  public async request(request: IWebSocketApiRequest): Promise<IWebSocketApiResponse> {
    if (!this.socket) {
      this.connect();
    }

    return new Promise((resolve, reject) => {
      this.socket!.timeout(30000).emit('api:request', request, (response: IWebSocketApiResponse) => {
        if (!response) {
          reject(new Error('WebSocket timeout/no response'));
          return;
        }
        if (!response.ok) {
          reject(new Error(response.error?.message || 'WebSocket operation failed'));
          return;
        }
        resolve(response);
      });
    });
  }
}

export default WebSocketApiClient;
