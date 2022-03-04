const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    ['^tet/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^tet/shared\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: [],
};
