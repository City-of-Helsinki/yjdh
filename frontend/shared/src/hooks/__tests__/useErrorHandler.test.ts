import { renderHook } from '@testing-library/react';

import useErrorHandler from '../useErrorHandler';

const mockT = (key: string): string => key;
const mockGoToPage = jest.fn();

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/application' }),
}));

jest.mock('../useGoToPage', () => ({
  __esModule: true,
  default: () => mockGoToPage,
}));

describe('useErrorHandler', () => {
  it('keeps the handler stable when only the options object identity changes', () => {
    const onAuthError = jest.fn();
    const onServerError = jest.fn();
    const onCommonError = jest.fn();
    const { result, rerender } = renderHook(
      ({ options }) => useErrorHandler(options),
      {
        initialProps: {
          options: { onAuthError, onServerError, onCommonError },
        },
      }
    );
    const initialHandler = result.current;

    rerender({
      options: { onAuthError, onServerError, onCommonError },
    });

    expect(result.current).toBe(initialHandler);
  });

  it('updates the handler when an individual callback changes', () => {
    const onAuthError = jest.fn();
    const { result, rerender } = renderHook(
      ({ options }) => useErrorHandler(options),
      { initialProps: { options: { onAuthError } } }
    );
    const initialHandler = result.current;

    rerender({ options: { onAuthError: jest.fn() } });

    expect(result.current).not.toBe(initialHandler);
  });
});
