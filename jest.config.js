module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '@src/(.*)$': '<rootDir>/src/$1',
    '@seed/(.*)$': '<rootDir>/seed/$1',
    '@test/(.*)$': '<rootDir>/test/$1',
  },
  modulePathIgnorePatterns: ['dist'],
};
