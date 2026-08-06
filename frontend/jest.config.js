module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!.pnpm/(uuid|hds-react|@babel\\+runtime)@)(?!(uuid|hds-react|@babel/runtime)/)',
  ],
  setupFilesAfterEnv: [require.resolve('./jest.setup.js')],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // pnpm builds multiple peer-variants of styled-components and next (the
    // optional `supports-color` peer of `debug`/@babel/core resolves to different
    // versions). Apps pnpm can't dedupe onto the majority variant (e.g.
    // benefit/applicant, the only app with the react-pdf/react-markdown stack) then
    // load a different physical copy than the shared Jest harness. That makes the
    // harness's ThemeProvider/useTheme return undefined and its jest.spyOn on
    // next/router miss ("NextRouter was not mounted"). Pin both to each app's own
    // single local copy so the harness and the component share one instance. This
    // mirrors the styled-components alias already in next.config.js for webpack.
    '^styled-components$': '<rootDir>/node_modules/styled-components',
    '^next/router$': '<rootDir>/node_modules/next/router',
  },
  collectCoverageFrom: [
    './src/**/*.{ts,tsx,js,jsx}',
    '!./src/**/*.sc.ts',
    '!./src/types/**/*',
    '!./src/utils/test-utils/**/*',
  ],
  modulePathIgnorePatterns: ['.next'],
  testPathIgnorePatterns: ['__tests__/utils', '__tests__/types', 'component-apis'],
};
