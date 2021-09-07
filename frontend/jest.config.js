module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    [`^shared\/(.*)$`]: '<rootDir>/shared/src/$1',
    [`kesaseteli/employer\/(.*)$`]: '<rootDir>/kesaseteli/employer/src/$1',
    [`kesaseteli/handler\/(.*)$`]: '<rootDir>/kesaseteli/handler/src/$1',
    [`benefit/applicant\/(.*)$`]: '<rootDir>/benefit/applicant/src/$1',
    [`benefit/handler\/(.*)$`]: '<rootDir>/benefit/handler/src/$1',
  },
  setupFilesAfterEnv: [
    '<rootDir>/shared/src/__tests_/utils/setupTests.ts',
    '<rootDir>benefit/applicant/test/i18n/i18n-test.ts',
    '<rootDir>benefit/handler/test/i18n/i18n-test.ts',
    '<rootDir>kesaseteli/employer/src/__tests__/utils/i18n/i18n-test.ts',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/kesaseteli/employer/src/pages/',
    '<rootDir>/benefit/applicant/src/pages/',
    '<rootDir>/benefit/handler/src/pages/',
    '<rootDir>/shared/src/server/next-server.js',
    '<rootDir>/shared/src/test/',
  ],
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  testPathIgnorePatterns: ['utils'],
};
