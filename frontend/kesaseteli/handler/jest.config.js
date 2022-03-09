const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^kesaseteli-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^kesaseteli/handler\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/kesaseteli/handler/src/pages/'],
};
