module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(uuid)/)'],
  setupFiles: [require.resolve('./jest.setup.js')],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    './src/**/*.{ts,tsx,js,jsx}',
    '!./src/**/*.sc.ts',
    '!./src/types/**/*',
    '!./src/utils/test-utils/**/*',
  ],
  modulePathIgnorePatterns: ['.next'],
  testPathIgnorePatterns: ['__tests__/utils', '__tests__/types', 'component-apis'],
};
