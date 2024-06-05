const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^tet-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^tet/youth\/(.*)$`]: '<rootDir>src/$1',
    '^axios$': require.resolve('axios'),
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/init-i18n.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/tet/youth/src/pages/'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(config);
