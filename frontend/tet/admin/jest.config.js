const sharedConfig = require('../../jest.config.js');
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json',
    },
  },
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    [`^tet-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^tet/admin\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/init-i18n.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/tet/admin/src/pages/'],
  verbose: true,
};

module.exports = createJestConfig(config);
