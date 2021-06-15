const sharedConfig = require('../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    ['^test-utils']: '<rootDir>/test/test-utils',
    [`^shared\/(.*)$`]: '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/server/next-server.js',
    '<rootDir>/test/',
  ],
};
