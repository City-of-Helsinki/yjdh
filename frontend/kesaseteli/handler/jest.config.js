const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^kesaseteli-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^kesaseteli/handler\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/../kesaseteli/shared/src/__tests__/utils/',
    '<rootDir>/../kesaseteli/youth/src/pages/',
    '<rootDir>/../../shared/src/server/next-server.js',
    '<rootDir>/../../shared/src/__tests__/component-apis/',
    '<rootDir>/../../shared/src/__tests__/utils/',
  ],
};

module.exports = createJestConfig(config);
