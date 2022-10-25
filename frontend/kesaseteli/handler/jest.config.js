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
    "^uuid$": "uuid",
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/kesaseteli/handler/src/pages/'],
};
