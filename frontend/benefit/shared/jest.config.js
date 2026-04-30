const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
    },
  },
  moduleNameMapper: {
    ['^benefit/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^benefit-shared\/(.*)$`]: '<rootDir>/src/$1',
    [`^benefit/shared\/(.*)$`]: '<rootDir>src/$1',
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>/test/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/pages/',
    '<rootDir>/src/__tests__/',
    '<rootDir>/src/components/statusIcon/',
    '<rootDir>/src/config/',
    '<rootDir>/src/constants.ts',
    '<rootDir>/src/backend-api/',
  ],
  testEnvironment: '<rootDir>/jest-canvas-env.js',
};
