const sharedConfig = require('../../jest.config.js');
module.exports = {
  ...sharedConfig,
  moduleNameMapper: {
    // NOTE: intentionally does NOT spread sharedConfig.moduleNameMapper. Those
    // pins map next/router and styled-components to `<rootDir>/node_modules/...`,
    // but this package is a pure library with no local next/styled-components
    // install. It resolves next/router via hoisting and relies on the global
    // next-router-mock from the shared setupTests.ts, so the pins would map to a
    // non-existent path here ("Could not locate module next/router").
    [`^shared\/(.*)$`]: '<rootDir>/../../shared/src/$1',
    ['^kesaseteli/shared/test/(.*)$']: '<rootDir>/test/$1',
    [`^kesaseteli-shared\/(.*)$`]: '<rootDir>/src/$1',
  },
  testEnvironment: '<rootDir>/../../shared/jest-canvas-env.js',
  setupFilesAfterEnv: [
    '<rootDir>/../../shared/src/__tests__/utils/setupTests.ts',
  ],
  coveragePathIgnorePatterns: [],
};
