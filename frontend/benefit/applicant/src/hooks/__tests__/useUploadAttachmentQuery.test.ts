import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useUploadAttachmentQuery from '../useUploadAttachmentQuery';

const getHookConfig = (): {
  mutationFn: (attachment: {
    applicationId?: string;
    data?: unknown;
  }) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
} =>
  renderHook(() => useUploadAttachmentQuery()).result.current as unknown as {
    mutationFn: (attachment: {
      applicationId?: string;
      data?: unknown;
    }) => Promise<unknown>;
    onSuccess: () => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useUploadAttachmentQuery', () => {
  const mockPost = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useBackendAPI as jest.Mock).mockReturnValue({
      axios: {
        post: mockPost,
      },
      handleResponse: mockHandleResponse,
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('posts attachment data with multipart header when application id exists', async () => {
    mockPost.mockResolvedValue({ data: {} });
    const formData = { some: 'data' };
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({
      applicationId: 'app-1',
      data: formData,
    });

    expect(mockPost).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/attachments/`,
      formData,
      {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      }
    );
  });

  it('rejects when application id is missing', async () => {
    const hookConfig = getHookConfig();

    await expect(hookConfig.mutationFn({ data: {} })).rejects.toThrow(
      'Missing application id'
    );
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('invalidates applications and application queries on success', async () => {
    mockInvalidateQueries.mockImplementation(async () => null);
    const hookConfig = getHookConfig();

    await hookConfig.onSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['applications'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['application'],
    });
  });
});
