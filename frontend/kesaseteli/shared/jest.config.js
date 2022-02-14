const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
    },
  },
  moduleNameMapper: {
    ['^kesaseteli/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^kesaseteli/shared\/(.*)$`]: '<rootDir>src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: [],
};
