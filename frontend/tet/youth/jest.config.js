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
    [`^tet-shared\/(.*)$`]: '<rootDir>../shared/src/$1',
    [`^tet/youth\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
    '<rootDir>src/__tests__/utils/init-i18n.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/tet/youth/src/pages/'],
};
