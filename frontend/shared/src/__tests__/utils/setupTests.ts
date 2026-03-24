// import '@testing-library/jest-dom';
// import { toHaveNoViolations } from 'jest-axe';
// import JEST_TIMEOUT from 'shared/__tests__/utils/jest-timeout';
// import { isString } from 'shared/utils/type-guards';

// jest.setTimeout(JEST_TIMEOUT);
// expect.extend(toHaveNoViolations);

// jest.mock('next/router', () => jest.requireActual('next-router-mock'));

/*
jest.mock('next/dist/shared/lib/router-context.shared-runtime', () => {
  const React = require('react');
  const mock = require('next-router-mock');
  return { RouterContext: React.createContext(mock.default) };
});

jest.mock('next/navigation', () => {
  const { useRouter } = require('next-router-mock');
  const { useSearchParams: useSearchParamsMock } = require('next-router-mock');
  return {
    useRouter,
    usePathname: jest.fn(() => '/'),
    useSearchParams: useSearchParamsMock,
    useParams: jest.fn(() => ({})),
    useSelectedLayoutSegment: jest.fn(() => null),
    useSelectedLayoutSegments: jest.fn(() => []),
  };
});
*/

/* eslint-disable no-console */
// const originalWarn = console.warn;
// const originalError = console.error;
/* eslint-enable no-console */

/*
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
];
*/

// const createFilter =
//   (original: (...data: unknown[]) => void) =>
//   (...args: unknown[]) => {
//     if (
//       args.length > 0 &&
//       isString(args[0]) &&
//       messagesToIgnore.some((msg) => (args[0] as string).includes(msg))
//     ) {
//       return;
//     }
//     original.apply(console, args);
//   };

// beforeAll(() => {
//   console.warn = createFilter(originalWarn);
//   console.error = createFilter(originalError);
// });

// window.scrollTo = jest.fn();

// afterAll(() => {
//   console.warn = originalWarn;
//   console.error = originalError;
// });
