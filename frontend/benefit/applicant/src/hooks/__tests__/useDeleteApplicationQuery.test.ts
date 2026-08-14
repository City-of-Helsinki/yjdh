import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useDeleteApplicationQuery from '../useDeleteApplicationQuery';

const getHookConfig = (): {
  mutationFn: (id: string) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
} =>
  renderHook(() => useDeleteApplicationQuery()).result.current as unknown as {
    mutationFn: (id: string) => Promise<unknown>;
    onSuccess: () => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useDeleteApplicationQuery', () => {
  const mockDelete = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockRemoveQueries = jest.fn();
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        delete: mockDelete,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      removeQueries: mockRemoveQueries,
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('calls delete endpoint with application id', async () => {
    mockDelete.mockResolvedValue({ data: null });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn('app-1');

    expect(mockDelete).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/`
    );
  });

  it('removes applications cache and invalidates applications list on success', async () => {
    mockInvalidateQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess();

    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
      exact: true,
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applicationsList'],
    });
  });
});
