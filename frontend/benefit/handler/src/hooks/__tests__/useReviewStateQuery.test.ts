import '@testing-library/jest-dom';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useReviewStateQuery from '../useReviewStateQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useReviewStateQuery', () => {
  const axios = { get: jest.fn() };
  const handleResponse = jest.fn();
  let capturedQueryFn: () => unknown;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });

    (useQuery as jest.Mock).mockImplementation((options) => {
      capturedQueryFn = options.queryFn as () => unknown;
      return {};
    });
  });

  it('is enabled only when id is provided', () => {
    renderHook(() => useReviewStateQuery(''));

    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false })
    );
  });

  it('calls the review endpoint with the given id', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue({});

    renderHook(() => useReviewStateQuery('app-123'));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}app-123/review/`
    );
  });

  it('rejects when id is empty', async () => {
    renderHook(() => useReviewStateQuery(''));

    await expect(capturedQueryFn()).rejects.toThrow('Missing application id');
  });
});
