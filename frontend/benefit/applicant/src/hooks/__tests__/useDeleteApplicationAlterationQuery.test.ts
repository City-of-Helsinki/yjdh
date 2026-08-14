import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDeleteApplicationAlterationQuery from '../useDeleteApplicationAlterationQuery';

const getHookConfig = (): {
  mutationFn: (params: {
    id: string;
    applicationId: string;
  }) => Promise<unknown>;
  onSuccess: (
    _data: unknown,
    params: { id: string; applicationId: string }
  ) => Promise<unknown>;
} =>
  renderHook(() => useDeleteApplicationAlterationQuery()).result
    .current as unknown as {
    mutationFn: (params: {
      id: string;
      applicationId: string;
    }) => Promise<unknown>;
    onSuccess: (
      _data: unknown,
      params: { id: string; applicationId: string }
    ) => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useDeleteApplicationAlterationQuery', () => {
  const mockDelete = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockResetQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        delete: mockDelete,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      resetQueries: mockResetQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('calls delete alteration endpoint with alteration id', async () => {
    mockDelete.mockResolvedValue({ data: null });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({ id: 'alt-1', applicationId: 'app-1' });

    expect(mockDelete).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATION_ALTERATION}alt-1/`
    );
  });

  it('resets application query on success using application id', async () => {
    mockResetQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess(null, { id: 'alt-1', applicationId: 'app-1' });

    expect(mockResetQueries).toHaveBeenCalledWith({
      queryKey: ['applications', 'app-1'],
    });
  });
});
