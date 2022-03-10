const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^benefit-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`benefit/handler\/(.*)$`]: '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>/test/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/pages/',
    '<rootDir>/../../shared/src/server/next-server.js',
    '<rootDir>/../../shared/src/test/',
  ],
};

module.exports = createJestConfig(config);
