module.exports = {
  apps: [
    {
      name: 'aaa-dev-restapi',
      script: './src/interface/HTTP/adapters/start-rest-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.dev',
      env: {
        NODE_ENV: 'dev',
        AAA_HTTP_PORT: '3000'
      }
    },
    {
      name: 'aaa-dev-websocketapi',
      script: './src/interface/WebSocket/adapters/start-websocket-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.dev',
      env: {
        NODE_ENV: 'dev',
        AAA_WEBSOCKET_PORT: '3001',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'websocket',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-dev-grpcapi',
      script: './src/interface/gRPC/adapters/start-grpc-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.dev',
      env: {
        NODE_ENV: 'dev',
        AAA_GRPC_PORT: '3002',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'grpc',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-dev-service-management',
      script: './apps/service-management/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'dev',
        AAA_SERVICE_MANAGEMENT_PORT: '3200'
      }
    }
  ]
};
