import '@testing-library/jest-dom';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { PROPOSALS_FOR_DECISION } from 'benefit-shared/constants';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useReportsApplicationBatchesQuery, {
  getReportsApplicationBatchesQueryKey,
} from '../useReportsApplicationBatchesQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useReportsApplicationBatchesQuery', () => {
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

  describe('getReportsApplicationBatchesQueryKey', () => {
    it('returns the correct key string', () => {
      const key = getReportsApplicationBatchesQueryKey(
        PROPOSALS_FOR_DECISION.ACCEPTED
      );
      expect(key).toBe(
        `${BackendEndpoint.APPLICATION_BATCHES}${PROPOSALS_FOR_DECISION.ACCEPTED}`
      );
    });
  });

  it('calls the batches endpoint with the proposal_for_decision param', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    renderHook(() =>
      useReportsApplicationBatchesQuery(PROPOSALS_FOR_DECISION.ACCEPTED)
    );

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATION_BATCHES}?proposal_for_decision=${PROPOSALS_FOR_DECISION.ACCEPTED}`
    );
  });

  it('rejects when proposalForDecision is falsy', async () => {
    renderHook(() =>
      useReportsApplicationBatchesQuery('' as unknown as PROPOSALS_FOR_DECISION)
    );

    await expect(capturedQueryFn()).rejects.toThrow(
      'Missing proposalForDecision'
    );
  });
});
