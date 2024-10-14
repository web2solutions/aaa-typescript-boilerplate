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
      'spec/**'
    ],
    include: [
      'spec/**'
    ]
  },
  functions: {
    localhost_get: {
      handler: 'src/interface/HTTP/adapters/aws/lambda/handlers/localhost.getHandler',
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
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/create.handler',
      package: {
        individually: true,
        patterns: [
          'spec/**'
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
