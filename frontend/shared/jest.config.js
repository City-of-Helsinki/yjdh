const sharedConfig = require('../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    [`^shared/(.*)$`]: '<rootDir>/src/$1',
    axios: '<rootDir>/axios/dist/node/axios.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/utils/setupTests.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/server/next-server.js',
    '<rootDir>/test/',
  ],
};
