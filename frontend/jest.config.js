module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ["^test-utils"]: "<rootDir>/shared/test/test-utils",
    [`^shared\/(.*)$`]: "<rootDir>/shared/src/$1",
    [`kesaseteli/employer\/(.*)$`]: "<rootDir>/kesaseteli/employer/src/$1",
    [`kesaseteli/handler\/(.*)$`]: "<rootDir>/kesaseteli/handler/src/$1",
  },
  setupFilesAfterEnv: ['<rootDir>/shared/test/setupTests.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/kesaseteli/employer/src/pages/',
    '<rootDir>/shared/src/server/next-server.js',
    '<rootDir>/shared/test/',
  ],
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  testPathIgnorePatterns : ['utils']
};
