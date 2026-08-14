import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useMutation } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useSearchApplicationQuery from '../useSearchApplicationQuery';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useSearchApplicationQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedMutationFn: (q: string) => unknown;
  let capturedOnError: () => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue({ results: [] });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnError = options.onError;
      return { mutate: jest.fn() };
    });
  });

  it('calls the search endpoint with the query string', async () => {
    renderHook(() => useSearchApplicationQuery());

    await capturedMutationFn('test query');

    expect(axios.get).toHaveBeenCalledWith(
      BackendEndpoint.SEARCH,
      expect.objectContaining({
        params: expect.objectContaining({ q: 'test query' }),
      })
    );
  });

  it.each([
    ['archived', () => useSearchApplicationQuery(true), { archived: '1' }],
    [
      'archival',
      () => useSearchApplicationQuery(false, true),
      { archival: '1' },
    ],
    [
      'app_no',
      () =>
        useSearchApplicationQuery(
          false,
          false,
          undefined,
          undefined,
          'HEL-123'
        ),
      { app_no: 'HEL-123' },
    ],
    [
      'load_all',
      () =>
        useSearchApplicationQuery(
          false,
          false,
          undefined,
          undefined,
          undefined,
          true
        ),
      { load_all: '1' },
    ],
  ] as const)(
    'includes %s param when the corresponding flag is set',
    async (_param, hook, expectedParam) => {
      renderHook(hook);

      await capturedMutationFn('q');

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining(expectedParam),
        })
      );
    }
  );

  it('shows error toast on error', () => {
    renderHook(() => useSearchApplicationQuery());

    capturedOnError();

    expect(showErrorToast).toHaveBeenCalled();
  });
});
