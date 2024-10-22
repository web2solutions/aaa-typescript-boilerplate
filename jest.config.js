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
  modulePathIgnorePatterns: ['dist', '.build', '.serverless', '.resources'],
  setupFiles: ["./ci-cd/loadEnvironment.js"],
};
