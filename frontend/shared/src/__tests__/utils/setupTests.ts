import '@testing-library/jest-dom';

import { toHaveNoViolations } from 'jest-axe';
import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';
import { isString } from 'shared/utils/type-guards';

jest.setTimeout(JEST_TIMEOUT);
expect.extend(toHaveNoViolations);

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

// Next.js 15's useRouter throws if RouterContext is null.
// Mock the shared-runtime context to provide the mock router as fallback.
jest.mock('next/dist/shared/lib/router-context.shared-runtime', () => {
  const React = require('react');
  const mock = require('next-router-mock');
  return { RouterContext: React.createContext(mock.default) };
});

/* eslint-disable no-console */
const originalWarn = console.warn;
const originalError = console.error;
const originalInfo = console.info;
/* eslint-enable no-console */

const messagesToIgnore = [
  'Warning: You seem to have overlapping act() calls, this is not supported',
  'When testing, code that causes React state updates should be wrapped into act(...)',
  'An update to',
  'Decide between using a controlled or uncontrolled Downshift element for the lifetime of the component',
  'Using ReactElement as a label is against good usability and accessibility practices. Please prefer plain strings.',
  'react-i18next:: You will need to pass in an i18next instance by using initReactI18next',
  'downshift: A component has changed the uncontrolled prop',
  'ReactDOM.render is no longer supported in React 18',
  'All radio buttons in a SelectionGroup are unchecked',
  'Could not parse CSS stylesheet',
  'i18next is made possible by our own product, Locize',
];

// Directly replace console methods instead of using jest.spyOn so that
// jest's reporter does not capture and redisplay the suppressed messages.
const createFilter =
  (original: (...data: unknown[]) => void) =>
    (...args: unknown[]) => {
      const firstArg = args[0];
      const message =
        isString(firstArg)
          ? firstArg
          : firstArg instanceof Error
            ? firstArg.message
            : '';
      if (
        args.length > 0 &&
        message.length > 0 &&
        messagesToIgnore.some((msg) => message.includes(msg))
      ) {
        return;
      }
      original.apply(console, args);
    };

// Apply filters immediately (not in beforeAll) so they catch errors
// that fire during module initialization (e.g. jsdom CSS parse errors from HDS React).
console.warn = createFilter(originalWarn);
console.error = createFilter(originalError);
console.info = createFilter(originalInfo);

beforeAll(() => {
  console.warn = createFilter(originalWarn);
  console.error = createFilter(originalError);
  console.info = createFilter(originalInfo);
});

if (typeof window.ResizeObserver === 'undefined') {
  class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }

  // Provide the API both on window and global for libraries accessing either.
  window.ResizeObserver = ResizeObserver;
  global.ResizeObserver = ResizeObserver;
}

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = jest.fn();
}

window.scrollTo = jest.fn();

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
  console.info = originalInfo;
});
