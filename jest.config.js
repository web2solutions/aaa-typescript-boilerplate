const nodeMajor = Number(process.versions.node.split('.')[0]);
const unsupportedRuntimeIgnorePatterns = nodeMajor > 22
  ? [
    '<rootDir>/test/integration/Hyper-Express/',
    '<rootDir>/test/integration/Restify/',
    '<rootDir>/test/integration/mutex/redis.restify.test.ts'
  ]
  : [];
const redisIntegrationIgnorePatterns = process.env.RUN_REDIS_INTEGRATION
  ? []
  : ['<rootDir>/test/integration/mutex/'];

module.exports = {
  preset: 'ts-jest',
  verbose: true,
  detectOpenHandles: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@src/(.*)$': '<rootDir>/src/$1',
    '@seed/(.*)$': '<rootDir>/seed/$1',
    '@test/(.*)$': '<rootDir>/test/$1',
  },
  testPathIgnorePatterns: [
    ...unsupportedRuntimeIgnorePatterns,
    ...redisIntegrationIgnorePatterns
  ],
  modulePathIgnorePatterns: ['dist', '.build', '.serverless', '.resources'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 99,
      lines: 99,
      statements: 99
    }
  },
  setupFiles: ["./ci-cd/loadEnvironment.js"],
};
