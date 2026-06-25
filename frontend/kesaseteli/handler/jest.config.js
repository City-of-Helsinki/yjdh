const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^kesaseteli-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^kesaseteli/handler\/(.*)$`]: '<rootDir>src/$1',
  },
  testEnvironment: '<rootDir>/../../shared/jest-canvas-env.js',
  // jsdom env defaults customExportConditions to ['browser'], which makes axios
  // resolve its browser build (no Node 'http' adapter). Tests force the http
  // adapter so nock can intercept requests, so prefer the default (node) build.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/i18n/i18n-test.ts',
  ],
  collectCoverageFrom: [
    './src/**/*.{ts,tsx,js,jsx}',
    '!./src/pages/**/*',
    '!./src/**/*.sc.ts',
    '!./src/types/**/*',
    '!./src/utils/test-utils/**/*',
  ],
};
