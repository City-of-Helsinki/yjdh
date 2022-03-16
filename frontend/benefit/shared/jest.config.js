const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  moduleNameMapper: {
    ['^benefit/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^benefit/shared\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/benefit/shared/src/pages/'],
};

module.exports = createJestConfig(config);
