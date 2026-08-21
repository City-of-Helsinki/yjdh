import '@testing-library/jest-dom';
import '../../../test/i18n/i18n-test';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import showErrorToast from 'shared/components/toast/show-error-toast';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useBatchQuery from '../useBatchQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/show-error-toast', () => jest.fn());

describe('useBatchQuery', () => {
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

  it('calls the batches endpoint with joined statuses', async () => {
    renderHook(() =>
      useBatchQuery([
        BATCH_STATUSES.DRAFT,
        BATCH_STATUSES.AWAITING_FOR_DECISION,
      ])
    );

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      BackendEndpoint.APPLICATION_BATCHES,
      expect.objectContaining({
        params: expect.objectContaining({
          status: `${BATCH_STATUSES.DRAFT},${BATCH_STATUSES.AWAITING_FOR_DECISION}`,
        }),
      })
    );
  });

  it.each([
    ['provided', 'created_at', 'created_at'],
    ['default', undefined, '-created_at'],
  ] as const)('uses the %s order_by param', async (_label, input, expected) => {
    renderHook(() => useBatchQuery([BATCH_STATUSES.DRAFT], input));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ order_by: expected }),
      })
    );
  });

  it('shows error toast when query has error', () => {
    (useQuery as jest.Mock).mockReturnValue({ isError: true });

    renderHook(() => useBatchQuery([BATCH_STATUSES.DRAFT]));

    expect(showErrorToast).toHaveBeenCalled();
  });
});
