import '@testing-library/jest-dom';
import '../../../../test/i18n/i18n-test';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { Application } from 'benefit/handler/types/application';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDecisionProposalDraftMutation from '../useDecisionProposalDraftMutation';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock('shared/hooks/useBackendAPI', () => jest.fn());
jest.mock('shared/components/toast/Toast', () => jest.fn());

const buildApplication = (overrides: Partial<Application> = {}): Application =>
  ({ id: 'app-1', ...overrides } as Application);

describe('useDecisionProposalDraftMutation', () => {
  const axios = { patch: jest.fn() };
  const handleResponse = jest.fn();
  const invalidateQueries = jest.fn();
  let capturedMutationFn: (payload: Record<string, unknown>) => unknown;
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

  it('calls the decision proposal draft endpoint with snakecased payload', () => {
    handleResponse.mockReturnValue(Promise.resolve({}));
    axios.patch.mockReturnValue({});

    renderHook(() => useDecisionProposalDraftMutation(buildApplication()));

    capturedMutationFn({ grantedAsDeMinimisAid: true, someKey: 'value' });

    expect(axios.patch).toHaveBeenCalledWith(
      BackendEndpoint.DECISION_PROPOSAL_DRAFT,
      expect.objectContaining({
        granted_as_de_minimis_aid: true,
        some_key: 'value',
      })
    );
  });

  it('rejects when application id is missing', async () => {
    renderHook(() =>
      useDecisionProposalDraftMutation(buildApplication({ id: undefined }))
    );

    await expect(capturedMutationFn({})).rejects.toThrow(
      'Missing application id'
    );
  });

  it('invalidates applications and application on success', () => {
    renderHook(() => useDecisionProposalDraftMutation(buildApplication()));

    capturedOnSuccess();

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });
});
