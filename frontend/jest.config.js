module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  testPathIgnorePatterns: ['__tests__/utils', 'component-apis'],
};
