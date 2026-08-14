import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ApplicantEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useChangeEmployerAssuranceMutation from '../useChangeEmployerAssuranceMutation';

const getHookConfig = (): {
  mutationFn: (params: {
    applicationId: string;
    employerAssurance: boolean;
  }) => Promise<unknown>;
  onSuccess: (
    _data: unknown,
    params: { applicationId: string }
  ) => Promise<unknown>;
} =>
  renderHook(() => useChangeEmployerAssuranceMutation()).result
    .current as unknown as {
    mutationFn: (params: {
      applicationId: string;
      employerAssurance: boolean;
    }) => Promise<unknown>;
    onSuccess: (
      _data: unknown,
      params: { applicationId: string }
    ) => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useChangeEmployerAssuranceMutation', () => {
  const mockPatch = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        patch: mockPatch,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('patches employer assurance endpoint with payload', async () => {
    mockPatch.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({
      applicationId: 'app-1',
      employerAssurance: true,
    });

    expect(mockPatch).toHaveBeenCalledWith(
      ApplicantEndpoint.CHANGE_EMPLOYER_ASSURANCE('app-1'),
      { employerAssurance: true }
    );
  });

  it('invalidates related queries on success', async () => {
    mockInvalidateQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess(undefined, { applicationId: 'app-1' });

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications', 'app-1'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });
});
