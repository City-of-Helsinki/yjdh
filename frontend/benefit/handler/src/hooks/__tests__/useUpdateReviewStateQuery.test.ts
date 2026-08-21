import '@testing-library/jest-dom';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useUpdateReviewStateQuery from '../useUpdateReviewStateQuery';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useUpdateReviewStateQuery', () => {
  const axios = { put: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (reviewState: { application: string }) => unknown;
  let capturedOnSuccess: () => void;

  beforeEach(() => {
    jest.clearAllMocks();

    (useBackendAPI as jest.Mock).mockReturnValue({ axios, handleResponse });
    (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

    (useMutation as jest.Mock).mockImplementation((options) => {
      capturedMutationFn = options.mutationFn;
      capturedOnSuccess = options.onSuccess;
      return { mutate: jest.fn() };
    });
  });

  it('calls the review endpoint with PUT and the review state', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.put.mockReturnValue({});

    renderHook(() => useUpdateReviewStateQuery());

    const reviewState = { application: 'app-123', someField: 'value' };
    capturedMutationFn(reviewState as never);

    expect(axios.put).toHaveBeenCalledWith(
      `${BackendEndpoint.HANDLER_APPLICATIONS}app-123/review/`,
      reviewState
    );
  });

  it('invalidates reviewState query on success', () => {
    renderHook(() => useUpdateReviewStateQuery());

    capturedOnSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['reviewState'],
    });
  });
});
