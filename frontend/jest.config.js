module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ["^test-utils"]: "<rootDir>/shared/test/test-utils",
    [`^shared\/(.*)$`]: "<rootDir>/shared/src/$1",
    [`kesaseteli/employer\/(.*)$`]: "<rootDir>/kesaseteli/employer/src/$1",
    [`kesaseteli/handler\/(.*)$`]: "<rootDir>/kesaseteli/handler/src/$1",
    [`benefit/applicant\/(.*)$`]: "<rootDir>/benefit/applicant/src/$1",
    [`benefit/handler\/(.*)$`]: "<rootDir>/benefit/handler/src/$1",
  },
  setupFilesAfterEnv: [
    '<rootDir>/shared/test/setupTests.ts',
    '<rootDir>kesaseteli/employer/src/__tests__/utils/i18n/i18n-test.ts'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/kesaseteli/employer/src/pages/',
    '<rootDir>/benefit/applicant/src/pages/',
    '<rootDir>/shared/src/server/next-server.js',
    '<rootDir>/shared/test/',
  ],
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  testPathIgnorePatterns : ['utils']
};
