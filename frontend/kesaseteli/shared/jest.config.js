const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    ['^kesaseteli/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^kesaseteli/shared\/(.*)$`]: '<rootDir>src/$1',
  },
  testEnvironment: '<rootDir>/../../shared/jest-canvas-env.js',
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: [],
};
