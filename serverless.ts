// eslint-disable-next-line import/no-import-module-exports
import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  frameworkVersion: '4',
  org: 'web2solucoes',
  service: 'aaa-typescript-boilerplate',
  provider: {
    name: 'aws',
    runtime: 'nodejs22.x',
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
    },
    auth_login: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/login.handler',
      events: [{ http: { path: '/auth/login', method: 'POST' } }]
    },
    auth_logout: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/logout.handler',
      events: [{ http: { path: '/auth/logout', method: 'POST' } }]
    },
    auth_register: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/register.handler',
      events: [{ http: { path: '/auth/register', method: 'POST' } }]
    },
    auth_update_user_password: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateUserPassword.handler',
      events: [{ http: { path: '/auth/updateUserPassword', method: 'POST' } }]
    },
    user_get_all: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getAll.handler',
      events: [{ http: { path: '/users', method: 'GET' } }]
    },
    user_get_one: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getOneById.handler',
      events: [{ http: { path: '/users/{id}', method: 'GET' } }]
    },
    user_update: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/update.handler',
      events: [{ http: { path: '/users/{id}', method: 'PUT' } }]
    },
    user_delete: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteOne.handler',
      events: [{ http: { path: '/users/{id}', method: 'DELETE' } }]
    },
    user_update_password: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updatePassword.handler',
      events: [{ http: { path: '/users/{id}/updatePassword', method: 'PUT' } }]
    },
    user_create_email: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createEmail.handler',
      events: [{ http: { path: '/users/{id}/createEmail', method: 'POST' } }]
    },
    user_update_email: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateEmail.handler',
      events: [{ http: { path: '/users/{id}/updateEmail/{emailId}', method: 'PUT' } }]
    },
    user_delete_email: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteEmail.handler',
      events: [{ http: { path: '/users/{id}/deleteEmail/{emailId}', method: 'DELETE' } }]
    },
    user_create_document: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createDocument.handler',
      events: [{ http: { path: '/users/{id}/createDocument', method: 'POST' } }]
    },
    user_update_document: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateDocument.handler',
      events: [{ http: { path: '/users/{id}/updateDocument/{documentId}', method: 'PUT' } }]
    },
    user_delete_document: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteDocument.handler',
      events: [{ http: { path: '/users/{id}/documentDelete/{documentId}', method: 'DELETE' } }]
    },
    user_create_phone: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createPhone.handler',
      events: [{ http: { path: '/users/{id}/createPhone', method: 'POST' } }]
    },
    user_update_phone: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updatePhone.handler',
      events: [{ http: { path: '/users/{id}/updatePhone/{phoneId}', method: 'PUT' } }]
    },
    user_delete_phone: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deletePhone.handler',
      events: [{ http: { path: '/users/{id}/phoneDelete/{phoneId}', method: 'DELETE' } }]
    },
    organization_create: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/createOrganization.handler',
      events: [{ http: { path: '/organizations', method: 'POST' } }]
    },
    organization_get_all: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getAllOrganizations.handler',
      events: [{ http: { path: '/organizations', method: 'GET' } }]
    },
    organization_get_one: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/getOrganizationById.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'GET' } }]
    },
    organization_update: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/updateOrganization.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'PUT' } }]
    },
    organization_delete: {
      handler: 'src/modules/Users/interface/api/frameworks/aws/lambda/handlers/deleteOrganization.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'DELETE' } }]
    }
  }
};
module.exports = serverlessConfiguration;
