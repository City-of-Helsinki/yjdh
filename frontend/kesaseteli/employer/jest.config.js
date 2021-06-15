const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    ['^test-utils']: '<rootDir>/../../shared/test/test-utils',
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`kesaseteli/employer\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/test/setupTests.ts',
    '<rootDir>src/__tests__/utils/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/kesaseteli/employer/src/pages/'],
};
