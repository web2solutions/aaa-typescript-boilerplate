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
      
    }
  };