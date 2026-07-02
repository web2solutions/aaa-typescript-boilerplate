const path = require('path');

module.exports = {
    parser: '@typescript-eslint/parser',
    'parserOptions': {
      'project': 'tsconfig.json',
      'ecmaVersion': 2019,
      'sourceType': 'module'
    },
    plugins: [
      '@typescript-eslint', 'jest',
      '@typescript-eslint',
      'no-async-foreach'
    ],
    extends: [
      'airbnb-base',
      'plugin:jest/all',
      'plugin:import/errors',
      'plugin:import/warnings',
      'plugin:import/typescript',
      'plugin:@typescript-eslint/recommended',
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-async-foreach/no-async-foreach': 'error',
      'no-return-await' : 'error',
      'prefer-promise-reject-errors': 'error',
      'no-console': 'error',
      
      'import/extensions': 'off',
      'jest/no-hooks': 'off',
      'no-restricted-syntax': 'off',
      
      'import/no-unresolved': 'off',
      'import/no-dynamic-require': 'off',
      'global-require': 'off',

      'no-underscore-dangle': 'off',
      'import/prefer-default-export': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'import/no-cycle' : 'off',
      'arrow-body-style' : 'off',
      'jest/unbound-method': 'off',
      'import/no-extraneous-dependencies': ['error', {
        packageDir: [
          __dirname,
          path.join(__dirname, 'apps/backend-template'),
          path.join(__dirname, 'packages/sdk-rest-client'),
          path.join(__dirname, 'packages/sdk-websocket-client'),
          path.join(__dirname, 'packages/sdk-grpc-client'),
          path.join(__dirname, 'packages/message-mediator')
        ]
      }]
    },
    overrides: [
      {
        files: [
          'apps/backend-template/test/unit/sdk-clients/grpc/GrpcApiClient.test.ts',
          'src/interface/HTTP/adapters/restify/**/*.ts',
          'src/interface/HTTP/ports/IHTTPRequest.ts',
          'src/interface/HTTP/ports/IHTTPResponse.ts',
          'src/modules/Users/interface/restapi/frameworks/restify/**/*.ts',
          'test/integration/Restify/**/*.ts',
          'test/integration/mutex/redis.restify.test.ts'
        ],
        rules: {
          'import/no-extraneous-dependencies': 'off',
          'import/no-relative-packages': 'off'
        }
      }
    ]
  };
