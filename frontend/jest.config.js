const path = require('path');
const { lstatSync, readdirSync } = require('fs');
// get listing of packages in the mono repo
const basePath = path.resolve(__dirname);
const packages = readdirSync(basePath).filter(name => {
  return lstatSync(path.join(basePath, name)).isDirectory();
});
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ["test-utils"]: "<rootDir>/shared/test/test-utils",
    ...packages.reduce(
      (acc, package) => ({
        ...acc,
        [`^${package}\/(.*)$`]:
          `<rootDir>/${package}/src/$1`,
      }),
      {},
    ),
  },
  setupFilesAfterEnv: ['<rootDir>/shared/test/setupTests.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/employer/src/pages/',
    '<rootDir>/shared/src/server/next-server.js',
    '<rootDir>/shared/test/',
  ],
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  testPathIgnorePatterns : ['utils']
};
