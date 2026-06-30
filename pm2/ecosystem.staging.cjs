module.exports = {
  apps: [
    {
      name: 'aaa-staging-restapi',
      script: './src/interface/HTTP/adapters/start-rest-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.staging',
      env: {
        NODE_ENV: 'staging',
        AAA_HTTP_PORT: '4000'
      }
    },
    {
      name: 'aaa-staging-websocketapi',
      script: './src/interface/WebSocket/adapters/start-websocket-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.staging',
      env: {
        NODE_ENV: 'staging',
        AAA_WEBSOCKET_PORT: '4001',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'websocket',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-staging-grpcapi',
      script: './src/interface/gRPC/adapters/start-grpc-api.ts',
      interpreter: 'node',
      node_args: '-r ts-node/register -r tsconfig-paths/register --env-file=./src/config/.env.staging',
      env: {
        NODE_ENV: 'staging',
        AAA_GRPC_PORT: '4002',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'grpc',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-staging-servicemangement',
      script: './servicemangement/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'staging',
        AAA_SERVICE_MANAGEMENT_PORT: '4200'
      }
    }
  ]
};
