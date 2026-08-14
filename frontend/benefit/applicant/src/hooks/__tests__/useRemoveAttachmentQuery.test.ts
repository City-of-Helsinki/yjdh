import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import useBackendAPI from 'shared/hooks/useBackendAPI';

import useRemoveAttachmentQuery from '../useRemoveAttachmentQuery';

const getHookConfig = (): {
  mutationFn: (attachment: {
    applicationId?: string;
    attachmentId?: string;
  }) => Promise<unknown>;
  onSuccess: () => Promise<unknown>;
} =>
  renderHook(() => useRemoveAttachmentQuery()).result.current as unknown as {
    mutationFn: (attachment: {
      applicationId?: string;
      attachmentId?: string;
    }) => Promise<unknown>;
    onSuccess: () => Promise<unknown>;
  };

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('shared/hooks/useBackendAPI');

describe('useRemoveAttachmentQuery', () => {
  const mockDelete = jest.fn();
  const mockHandleResponse = jest.fn((promise) => promise);
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
      invalidateQueries: mockInvalidateQueries,
    });
    (useMutation as jest.Mock).mockImplementation((config) => config);
  });

  it('calls attachment delete endpoint when application id exists', async () => {
    mockDelete.mockResolvedValue({ data: {} });
    const hookConfig = getHookConfig();

    await hookConfig.mutationFn({
      applicationId: 'app-1',
      attachmentId: 'att-1',
    });

    expect(mockDelete).toHaveBeenCalledWith(
      `${BackendEndpoint.APPLICATIONS}app-1/attachments/att-1/`
    );
  });

  it('rejects when application id is missing', async () => {
    const hookConfig = getHookConfig();

    await expect(
      hookConfig.mutationFn({ attachmentId: 'att-1' })
    ).rejects.toThrow('Missing application id');
    expect(mockDelete).not.toHaveBeenCalled();
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
