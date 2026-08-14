import '@testing-library/jest-dom';

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDecisionProposalTemplateQuery from '../useDecisionProposalTemplateQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());

describe('useDecisionProposalTemplateQuery', () => {
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

  it('calls the decision proposal template endpoint with correct params', async () => {
    axios.get.mockReturnValue({});
    handleResponse.mockResolvedValue([]);

    renderHook(() => useDecisionProposalTemplateQuery('app-1', 'ACCEPTED'));

    await capturedQueryFn();

    expect(axios.get).toHaveBeenCalledWith(
      String(BackendEndpoint.DECISION_PROPOSAL_TEMPLATE),
      expect.objectContaining({
        params: {
          decision_type: 'ACCEPTED',
          application_id: 'app-1',
        },
      })
    );
  });

  it('rejects when id is empty', async () => {
    renderHook(() => useDecisionProposalTemplateQuery('', 'ACCEPTED'));

    await expect(capturedQueryFn()).rejects.toThrow('Missing application id');
  });
});
