import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';
import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';

jest.setTimeout(JEST_TIMEOUT);

expect.extend(toHaveNoViolations);

// eslint-disable-next-line no-console
const originalError = console.error;
let consoleSpy: jest.SpyInstance;
beforeAll(() => {
  const messagesToIgnore = [
    'Warning: You seem to have overlapping act() calls, this is not supported',
    'react-i18next:: You will need to pass in an i18next instance by using initReactI18next',
  ];

  consoleSpy = jest.spyOn(console, 'warn').mockImplementation((...args) => {
    if (
      typeof args[0] === 'string' &&
      messagesToIgnore.some((msg) => args[0].includes(msg))
    ) {
      return () => {};
    }
    return originalError.call(console, args);
  });
});

afterAll(() => {
  consoleSpy.mockRestore();
});
