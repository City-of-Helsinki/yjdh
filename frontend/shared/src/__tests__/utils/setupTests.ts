import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';
import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';
import { isString } from 'shared/utils/type-guards';

jest.setTimeout(JEST_TIMEOUT);
expect.extend(toHaveNoViolations);

// eslint-disable-next-line no-console
const originalError = console.error;
let consoleWarnSpy: jest.SpyInstance;
let consoleErrorSpy: jest.SpyInstance;
beforeAll(() => {
  const messagesToIgnore = [
    'Warning: You seem to have overlapping act() calls, this is not supported',
    'When testing, code that causes React state updates should be wrapped into act(...)',
    'Decide between using a controlled or uncontrolled Downshift element for the lifetime of the component',
    'Using ReactElement as a label is against good usability and accessibility practices. Please prefer plain strings.',
    'react-i18next:: You will need to pass in an i18next instance by using initReactI18next',
    'downshift: A component has changed the uncontrolled prop',
  ];

  const filterErrors = (...args: string[]) => {
    if (
      typeof isString(args[0]) &&
      messagesToIgnore.some((msg) => args[0]?.includes(msg))
    ) {
      return () => {};
    }
    return originalError.call(console, args);
  };

  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(filterErrors);
  consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(filterErrors);
});

window.scrollTo = jest.fn();

afterAll(() => {
  consoleWarnSpy.mockRestore();
  consoleErrorSpy.mockRestore();
});
