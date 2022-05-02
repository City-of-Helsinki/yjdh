module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['./**/*.{ts,tsx,js,jsx}'],
  modulePathIgnorePatterns: ['.next'],
  testPathIgnorePatterns: ['__tests__/utils','__tests__/types', 'component-apis'],
};
