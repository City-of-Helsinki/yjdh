import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useApplicationsQuery from '../useApplicationsQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useApplicationsQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedQueryFn: () => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return { isError: false };
    });
  });

  it('calls the simplified handler applications endpoint with status params', async () => {
    renderHook(() => useApplicationsQuery(['received'], 'company_name'));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      BackendEndpoint.HANDLER_APPLICATIONS_SIMPLIFIED,
      expect.objectContaining({
        params: expect.objectContaining({
          status: 'received',
          order_by: 'company_name',
        }),
      })
    );
  });

  it.each([
    [
      'exclude_batched',
      () => useApplicationsQuery(['received'], 'id', true),
      { exclude_batched: '1' },
    ],
    [
      'filter_archived',
      () => useApplicationsQuery(['received'], 'id', false, true),
      { filter_archived: '1' },
    ],
    [
      'ahjo_case',
      () => useApplicationsQuery(['received'], 'id', false, false, true),
      { ahjo_case: '1' },
    ],
  ] as const)(
    'includes %s param when the corresponding flag is set',
    async (_name, hook, expectedParam) => {
      renderHook(hook);

      await capturedQueryFn();

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining(expectedParam),
        })
      );
    }
  );

  it('shows error toast when query has error', () => {
    (useQuery as jest.Mock).mockReturnValue({ isError: true });

    renderHook(() => useApplicationsQuery(['received']));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
