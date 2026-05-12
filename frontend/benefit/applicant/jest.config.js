const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  testPathIgnorePatterns: [
    ...(sharedConfig.testPathIgnorePatterns || []),
    '<rootDir>/src/__tests__/utils/',
  ],
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^benefit-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`benefit/applicant\/(.*)$`]: '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>/test/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/pages/',
    '<rootDir>/src/__tests__/utils/',
    '<rootDir>/../../shared/src/server/next-server.js',
    '<rootDir>/../../shared/src/test/',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: '<rootDir>/jest-canvas-env.js',
};

module.exports = createJestConfig(config);
