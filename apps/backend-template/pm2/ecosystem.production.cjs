module.exports = {
  apps: [
    {
      name: 'aaa-prod-restapi',
      script: './.build/interface/HTTP/adapters/start-rest-api.js',
      interpreter: 'node',
      node_args: '--env-file=./.build/config/.env.prod',
      env: {
        NODE_ENV: 'prod',
        AAA_HTTP_PORT: '5000'
      }
    },
    {
      name: 'aaa-prod-websocketapi',
      script: './.build/interface/WebSocket/adapters/start-websocket-api.js',
      interpreter: 'node',
      node_args: '--env-file=./.build/config/.env.prod',
      env: {
        NODE_ENV: 'prod',
        AAA_WEBSOCKET_PORT: '5001',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'websocket',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-prod-grpcapi',
      script: './.build/interface/gRPC/adapters/start-grpc-api.js',
      interpreter: 'node',
      node_args: '--env-file=./.build/config/.env.prod',
      env: {
        NODE_ENV: 'prod',
        AAA_GRPC_PORT: '5002',
        AAA_REALTIME_API: 'yes',
        AAA_REALTIME_API_PROTOCOL: 'grpc',
        AAA_DISABLE_FALLBACK_REST: 'true'
      }
    },
    {
      name: 'aaa-prod-service-management',
      script: './apps/service-management/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'prod',
        AAA_SERVICE_MANAGEMENT_PORT: '5200'
      }
    }
  ]
};
