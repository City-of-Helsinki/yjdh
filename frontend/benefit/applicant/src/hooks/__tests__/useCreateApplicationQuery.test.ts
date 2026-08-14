import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useCreateApplicationQuery from '../useCreateApplicationQuery';

const getHookConfig = (): {
  mutationFn: (application: { id?: string }) => Promise<unknown>;
  onSuccess: () => void;
} =>
  renderHook(() => useCreateApplicationQuery()).result.current as unknown as {
    mutationFn: (application: { id?: string }) => Promise<unknown>;
    onSuccess: () => void;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useCreateApplicationQuery', () => {
  const mockPost = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockRemoveQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        post: mockPost,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      removeQueries: mockRemoveQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('posts to applications endpoint', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({ id: 'a1' });

    expect(mockPost).toHaveBeenCalledWith(BackendEndpoint.APPLICATIONS, {
      id: 'a1',
    });
  });

  it('removes applications cache on success', () => {
    const hookConfig = getHookConfig();

    hookConfig.onSuccess();

    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
      exact: true,
    });
  });
});
