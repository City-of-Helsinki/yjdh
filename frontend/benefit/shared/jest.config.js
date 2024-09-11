const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/../../tsconfig.json',
    },
  },
  moduleNameMapper: {
    ['^benefit/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^benefit/shared\/(.*)$`]: '<rootDir>src/$1',
    axios: 'axios/dist/node/axios.cjs',
  },
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/benefit/shared/src/pages/'],
};
