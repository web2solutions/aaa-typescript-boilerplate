// eslint-disable-next-line import/no-import-module-exports
import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  frameworkVersion: '4',
  org: 'web2solucoes',
  service: 'aaa-typescript-boilerplate',
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    environment: {
      NODE_ENV: 'dev'
    },
    apiGateway: {
      minimumCompressionSize: 1024
    },
    profile: 'default',
    stage: 'dev'
  },
  package: {
    individually: true,
    patterns: [
      'src/infra/spec/**'
    ],
    include: [
      'src/infra/spec/**'
    ]
  },
  functions: {
    localhost_get: {
      handler: 'src/infra/server/HTTP/adapters/aws/lambda/handlers/localhost.getHandler',
      package: {
        individually: true
      },
      events: [
        {
          http: {
            path: '/',
            method: 'GET'
          }
        }
      ]
    },
    user_create: {
      handler: 'src/infra/server/HTTP/adapters/aws/lambda/handlers/users/create.handler',
      package: {
        individually: true,
        patterns: [
          'src/infra/spec/**'
        ]
      },
      events: [
        {
          http: {
            path: '/users',
            method: 'POST'
          }
        }
      ]
    }
  }
};
module.exports = serverlessConfiguration;
