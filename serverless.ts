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
      handler: 'apps/backend-template/src/interface/HTTP/adapters/aws/lambda/handlers/localhost.getHandler',
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
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/create.handler',
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
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/login.handler',
      events: [{ http: { path: '/auth/login', method: 'POST' } }]
    },
    auth_logout: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/logout.handler',
      events: [{ http: { path: '/auth/logout', method: 'POST' } }]
    },
    auth_register: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/register.handler',
      events: [{ http: { path: '/auth/register', method: 'POST' } }]
    },
    auth_update_user_password: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateUserPassword.handler',
      events: [{ http: { path: '/auth/updateUserPassword', method: 'POST' } }]
    },
    user_get_all: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/getAll.handler',
      events: [{ http: { path: '/users', method: 'GET' } }]
    },
    user_get_one: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/getOneById.handler',
      events: [{ http: { path: '/users/{id}', method: 'GET' } }]
    },
    user_update: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/update.handler',
      events: [{ http: { path: '/users/{id}', method: 'PUT' } }]
    },
    user_delete: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteOne.handler',
      events: [{ http: { path: '/users/{id}', method: 'DELETE' } }]
    },
    user_update_password: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updatePassword.handler',
      events: [{ http: { path: '/users/{id}/updatePassword', method: 'PUT' } }]
    },
    user_create_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createEmail.handler',
      events: [{ http: { path: '/users/{id}/createEmail', method: 'POST' } }]
    },
    user_update_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateEmail.handler',
      events: [{ http: { path: '/users/{id}/updateEmail/{emailId}', method: 'PUT' } }]
    },
    user_delete_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteEmail.handler',
      events: [{ http: { path: '/users/{id}/deleteEmail/{emailId}', method: 'DELETE' } }]
    },
    user_create_document: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createDocument.handler',
      events: [{ http: { path: '/users/{id}/createDocument', method: 'POST' } }]
    },
    user_update_document: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateDocument.handler',
      events: [{ http: { path: '/users/{id}/updateDocument/{documentId}', method: 'PUT' } }]
    },
    user_delete_document: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteDocument.handler',
      events: [{ http: { path: '/users/{id}/documentDelete/{documentId}', method: 'DELETE' } }]
    },
    user_create_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createPhone.handler',
      events: [{ http: { path: '/users/{id}/createPhone', method: 'POST' } }]
    },
    user_update_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updatePhone.handler',
      events: [{ http: { path: '/users/{id}/updatePhone/{phoneId}', method: 'PUT' } }]
    },
    user_delete_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deletePhone.handler',
      events: [{ http: { path: '/users/{id}/phoneDelete/{phoneId}', method: 'DELETE' } }]
    },
    organization_create: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createOrganization.handler',
      events: [{ http: { path: '/organizations', method: 'POST' } }]
    },
    organization_get_all: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/getAllOrganizations.handler',
      events: [{ http: { path: '/organizations', method: 'GET' } }]
    },
    organization_get_one: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/getOrganizationById.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'GET' } }]
    },
    organization_update: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateOrganization.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'PUT' } }]
    },
    organization_delete: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteOrganization.handler',
      events: [{ http: { path: '/organizations/{id}', method: 'DELETE' } }]
    },
    organization_create_address: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createOrganizationAddress.handler',
      events: [{ http: { path: '/organizations/{id}/createAddress', method: 'POST' } }]
    },
    organization_update_address: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateOrganizationAddress.handler',
      events: [{ http: { path: '/organizations/{id}/updateAddress/{addressId}', method: 'PUT' } }]
    },
    organization_delete_address: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteOrganizationAddress.handler',
      events: [{ http: { path: '/organizations/{id}/deleteAddress/{addressId}', method: 'DELETE' } }]
    },
    organization_create_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createOrganizationPhone.handler',
      events: [{ http: { path: '/organizations/{id}/createPhone', method: 'POST' } }]
    },
    organization_update_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateOrganizationPhone.handler',
      events: [{ http: { path: '/organizations/{id}/updatePhone/{phoneId}', method: 'PUT' } }]
    },
    organization_delete_phone: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteOrganizationPhone.handler',
      events: [{ http: { path: '/organizations/{id}/deletePhone/{phoneId}', method: 'DELETE' } }]
    },
    organization_create_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/createOrganizationEmail.handler',
      events: [{ http: { path: '/organizations/{id}/createEmail', method: 'POST' } }]
    },
    organization_update_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/updateOrganizationEmail.handler',
      events: [{ http: { path: '/organizations/{id}/updateEmail/{emailId}', method: 'PUT' } }]
    },
    organization_delete_email: {
      handler: 'apps/backend-template/src/modules/Users/interface/restapi/frameworks/aws/lambda/handlers/deleteOrganizationEmail.handler',
      events: [{ http: { path: '/organizations/{id}/deleteEmail/{emailId}', method: 'DELETE' } }]
    }
  }
};
module.exports = serverlessConfiguration;
